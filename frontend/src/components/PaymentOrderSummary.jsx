/**
 * Componente PaymentOrderSummary - Resumen del pedido en la página de pago
 * Muestra el desglose de precios y los productos del pedido de forma estática
 * Componente de solo lectura para confirmación final
 */
const PaymentOrderSummary = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Título del resumen */}
      <h3 className="text-lg font-semibold mb-6">Resumen del pedido</h3>
      
      {/* Sección de desglose de precios */}
      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sub Total</span>
          <span className="font-medium">134,00$</span>
        </div>
        
        {/* Costo de envío */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-medium">10,00$</span>
        </div>
        
        {/* Línea divisoria y total final */}
        <div className="border-t pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>144,00$</span>
          </div>
        </div>
      </div>
      
      {/* Sección de resumen de productos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium mb-3 text-gray-700">Resumen de productos</p>
        
        {/* Lista de productos con precios */}
        <div className="space-y-2 text-sm">
          {/* Producto 1: Ramo de flores secas */}
          <div className="flex justify-between">
            <span className="text-gray-600">Ramo de flores secas lavanda x 3</span>
            <span className="font-medium">30,00$</span>
          </div>
          
          {/* Producto 2: Cuadro sencillo */}
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