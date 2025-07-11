// Importa la biblioteca de React para poder definir componentes.
import React from "react";

/**
 * Componente funcional para mostrar la imagen principal de un producto y una galería de miniaturas.
 * Es un componente "presentacional" o "tonto" porque solo muestra datos y delega la lógica al componente padre.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {string[]} props.sampleImages - Un array de URLs de las imágenes de miniatura.
 * @param {string} props.selectedImage - La URL de la imagen que está seleccionada y se muestra en grande.
 * @param {Function} props.setSelectedImage - La función (del componente padre) que se llama para cambiar la imagen seleccionada.
 */
const ProductImages = ({ sampleImages, selectedImage, setSelectedImage }) => (
  // Contenedor principal del componente.
  <div>
    {/* Muestra la imagen principal del producto. La fuente (src) es la imagen seleccionada. */}
       <img src={selectedImage} alt="Producto" className="rounded-md w-full" />
    {/* Contenedor para las imágenes de miniatura. */}   
    <div className="flex gap-13 mt-4 justify-center items-center">
      {/* Itera sobre el array de 'sampleImages' para renderizar cada miniatura. */}
           
      {sampleImages.map((img, i) => (
        <img
          // La prop 'key' es necesaria en las listas de React para un renderizado eficiente.
          key={i}
          // La fuente de la imagen de miniatura.
          src={img}
          // Texto alternativo para la miniatura.
          alt={`Miniatura ${i}`}
          // Al hacer clic en una miniatura, se llama a la función del padre para actualizar la imagen principal.
          onClick={() => setSelectedImage(img)}
          // Clases de Tailwind CSS para estilizar la imagen.
          className="object-contain rounded-md cursor-pointer"
          // Estilos en línea para definir un tamaño fijo para las miniaturas.
          style={{ width: "110px", height: "110px" }}
        />
      ))}
         
    </div>
     
  </div>
);

// Exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
export default ProductImages;
