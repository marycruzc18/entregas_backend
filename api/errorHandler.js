const errorDictionary = {
    PRODUCT_NOT_FOUND: 'Producto no encontrado.',
    PRODUCT_ALREADY_IN_CART: 'El producto ya está en el carrito.',
    PRODUCT_CREATE_SUCCESSFULLY: 'Producto creado exitosamente.',
    ERROR_CREATING_THE_PRODUCT:'Error al crear el producto.'
  };
  
  function getErrorMessage(errorCode) {
    return errorDictionary[errorCode] || 'Error desconocido';
  }
  
  export default  { getErrorMessage };
  