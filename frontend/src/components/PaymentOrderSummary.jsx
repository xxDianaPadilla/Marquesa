const PaymentOrderSummary = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-6">Resumen del pedido</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sub Total</span>
          <span className="font-medium">134,00$</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-medium">10,00$</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>144,00$</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-3 text-gray-700">Resumen de productos</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ramo de flores secas lavanda x 3</span>
            <span className="font-medium">30,00$</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cuadro sencillo de hogar x 2</span>
            <span className="font-medium">68,00$</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOrderSummary;