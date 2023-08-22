import request from 'supertest';
import app from '../../app';

describe('Products API', () => {
    let productId; 
  
    it('should create a new product', async () => {
      const newProduct = {"title":"Cinturón","description":"Cinturón Rosado","price":2800,"thumbnail":"sin foto","code":5856,"stock":130,"status":true,"category":"cinturon"};
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      productId = response.body.id; 
    });
  
    it('should get details of a specific product', async () => {
   
      if (!productId) {
        throw new Error('El ID del producto no está definido.');
      }
  
      const response = await request(app).get(`/api/products/${productId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', productId);
    });
  });