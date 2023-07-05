import express from 'express';
import cartsModel from '../../dao/models/carts.model.js';
import productModel from '../../dao/models/products.model.js';

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
}

    
    export default CartController;