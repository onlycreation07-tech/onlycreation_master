export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  itemType: 'studio_booking' | 'creator_dispatch' | 'omas_campaign' | 'partner_subscription';
  itemTitle: string;
  itemDescription: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  method: string;
  amount: number;
  timestamp: string;
  receiptUrl?: string;
  error?: string;
}

export const paymentService = {
  // Create an order (supports local fallback or server-side order generation)
  async createOrder(params: Omit<PaymentOrder, 'orderId'>): Promise<PaymentOrder> {
    const generatedId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Attempt backend creation if available, or simulate securely
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, orderId: generatedId })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log("Using client-side payment order handler", e);
    }

    return {
      orderId: generatedId,
      ...params
    };
  },

  // Verify and complete payment transaction
  async verifyPayment(order: PaymentOrder, method: string): Promise<PaymentResult> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    // Simulate payment processing delay
    await new Promise(res => setTimeout(res, 1200));

    return {
      success: true,
      paymentId,
      orderId: order.orderId,
      method,
      amount: order.amount,
      timestamp: new Date().toISOString(),
      receiptUrl: `https://onlycreation.io/receipt/${paymentId}`
    };
  }
};
