import cartsModel from '../../dao/models/carts.model.js';
import productModel from '../../dao/models/products.model.js';
import Ticket from '../../dao/models/ticket.model.js';

class CartController {
  async createCart(req, res) {
    try {
      const newCart = new cartsModel({
        products: []
      });

      await newCart.save();

      res.send(`Carrito creado exitosamente con ID: ${newCart._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al crear el carrito');
    }
  }

  async addProductToCart(req, res) {
    try {
      const cartId = req.params.idcart;
      const productId = req.params.pid;

      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).send('Carrito no encontrado');
        return;
      }

      const product = await productModel.findById(productId);
      if (!product) {
        res.status(404).send('Producto no encontrado');
        return;
      }

      cart.products.push(product);
      await cart.save();

      res.send('Producto agregado al carrito exitosamente');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al agregar el producto al carrito');
    }
  }

  async removeProductFromCart(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }

      const productIndex = cart.products.findIndex((product) => product._id.toString() === productId);
      if (productIndex === -1) {
        res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
        return;
      }

      cart.products.splice(productIndex, 1);
      await cart.save();

      res.json({ mensaje: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al eliminar el producto del carrito' });
    }
  }

  async updateCart(req, res) {
    try {
      const cartId = req.params.cid;
      const { products } = req.body;

      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }

      cart.products = products;
      await cart.save();

      res.json({ mensaje: 'Carrito actualizado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al actualizar el carrito' });
    }
  }

  async updateProductQuantity(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const { quantity } = req.body;

      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }

      const productIndex = cart.products.findIndex((product) => product._id.toString() === productId);
      if (productIndex === -1) {
        res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
        return;
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({ mensaje: 'Cantidad del producto actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Error al actualizar la cantidad del producto en el carrito' });
  }
}
async generateTicket(cart, purchaseItems, outOfStockItems) {
  try {
    const code = generateUniqueCode(); // Implementa la generación de un código único para el ticket

    const totalAmount = purchaseItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    const ticket = new Ticket({
      code,
      amount: totalAmount,
      purchaser: cart.userId // Ajusta el campo de acuerdo a tu estructura de carrito y usuario
    });

    await ticket.save();

    return ticket;
  } catch (error) {
    console.error(error);
    throw new Error('Error al generar el ticket');
  }
}
async purchaseCart(req, res) {
  try {
    const cartId = req.params.cid;

    const cart = await cartsModel.findById(cartId);
    if (!cart) {
      res.status(404).json({ mensaje: 'Carrito no encontrado' });
      return;
    }

    // Obtener los productos del carrito
    const products = cart.products;

    // Realizar la lógica de compra
    const purchaseItems = [];
    const outOfStockItems = [];

    for (const item of products) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        outOfStockItems.push(item.productId);
        continue;
      }

      if (product.stock >= item.quantity) {
        // Restar el stock del producto
        product.stock -= item.quantity;
        await product.save();

        // Agregar el producto al arreglo de compra
        purchaseItems.push({
          product,
          quantity: item.quantity
        });
      } else {
        outOfStockItems.push(item.productId);
      }
    }

    // Generar el ticket con los datos de la compra
    const ticket = await this.generateTicket(cart, purchaseItems, outOfStockItems);

    // Actualizar el carrito para filtrar los productos sin disponibilidad
    const remainingProducts = products.filter((item) => !outOfStockItems.includes(item.productId));
    cart.products = remainingProducts;
    await cart.save();

    res.json({ mensaje: 'Compra realizada exitosamente', purchaseItems, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Error al finalizar la compra' });
  }
}


}





    
    export default CartController;