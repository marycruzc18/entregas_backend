import request from 'supertest';
import app from '../../app';


describe('Carts API', () => {
    let productId;
  
    before(async () => {
      const newProduct = { title: 'Producto de prueba', price: 100 };
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);
      productId = response.body.id;
    });
  
    it('should get the user\'s cart', async () => {
      const response = await request(app).get('/api/carts');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });
  
    it('should add a product to the user\'s cart', async () => {
      const response = await request(app)
        .post('/api/carts/add')
        .send({ productId });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Product added to cart');
    });
  
    it('should remove a product from the user\'s cart', async () => {
      const response = await request(app).delete(`/api/carts/remove/${productId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Product removed from cart');
    });
  });
  