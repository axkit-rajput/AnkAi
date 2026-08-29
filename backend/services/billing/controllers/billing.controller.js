import axios from "axios"
import { PLANS } from "../config/Plans.js"
import razorpay from "../config/razorpay.js"
import Payment from "../models/payment.model.js"
import crypto from "crypto"

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const userId = req.headers["x-user-id"]

        if (!userId) {
            return res.status(401).json({ message: "unauthorized" })
        }

        const selectedPlan = PLANS[plan]

        if (!selectedPlan) {
            return res.status(404).json({ message: "plan not found" })
        }

        /* Razorpay rejects a zero-amount order, so "free" reached the provider
           only to fail with an opaque 500. */
        if (!selectedPlan.amount || selectedPlan.amount <= 0) {
            return res
                .status(400)
                .json({ message: "This plan cannot be purchased." })
        }

        const order = await razorpay.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `receipt-${Date.now()}`
        })

        await Payment.create({
            userId,
            orderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            plan: selectedPlan.id,
            currency: order.currency,
            status: "created"
        })

        return res.status(200).json({ order, plan: selectedPlan })
    } catch (error) {
        console.error("create order error:", error)
        return res.status(500).json({ message: "could not start checkout" })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "incomplete payment details" })
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        const expected = Buffer.from(expectedSignature, "utf8")
        const received = Buffer.from(String(razorpay_signature), "utf8")

        /* Constant-time compare; timingSafeEqual throws on length mismatch. */
        const signatureValid =
            expected.length === received.length &&
            crypto.timingSafeEqual(expected, received)

        if (!signatureValid) {
            return res.status(400).json({ message: "Payment Verification Failed" })
        }

        /* Claim the payment atomically. Verifying the same order twice used to
           credit the account twice, because status was overwritten and the
           credit call was made unconditionally. */
        const payment = await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id, status: { $ne: "paid" } },
            { $set: { status: "paid", paymentId: razorpay_payment_id } },
            { new: true }
        )

        if (!payment) {
            const existing = await Payment.findOne({ orderId: razorpay_order_id })

            if (!existing) {
                return res.status(404).json({ message: "Payment Not Found" })
            }

            /* Already credited - report success so a retry is harmless. */
            return res.status(200).json({ message: "Payment Verified" })
        }

        try {
            await axios.post(`${process.env.AUTH_SERVICE}/update-plan`, {
                userId: payment.userId,
                plan: payment.plan,
                credits: payment.credits
            })
        } catch (error) {
            /* The money was taken but crediting failed. Release the claim so a
               retry can finish the job instead of silently swallowing it. */
            console.error("credit grant failed:", error?.message || error)

            await Payment.updateOne(
                { _id: payment._id },
                { $set: { status: "created" } }
            )

            return res.status(502).json({
                message:
                    "Payment received but credits are not applied yet. Please retry in a moment."
            })
        }

        return res.status(200).json({ message: "Payment Verified" })
    } catch (error) {
        console.error("verify payment error:", error)
        return res.status(500).json({ message: "payment verification failed" })
    }
}
