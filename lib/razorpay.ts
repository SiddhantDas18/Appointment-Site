import Razorpay from "razorpay"

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateOrderData {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(data: CreateOrderData) {
  try {
    const order = await razorpay.orders.create({
      amount: data.amount * 100, // Convert to paise
      currency: data.currency || "INR",
      receipt: data.receipt,
      notes: data.notes,
    })
    return { success: true, order }
  } catch (error) {
    console.error("Razorpay order creation failed:", error)
    return { success: false, error }
  }
}

export async function createRefund(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Convert to paise if specified
    })
    return { success: true, refund }
  } catch (error) {
    console.error("Razorpay refund failed:", error)
    return { success: false, error }
  }
}
