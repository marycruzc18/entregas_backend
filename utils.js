import * as url from 'url';
import { Faker, en } from '@faker-js/faker';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export { __filename, __dirname };


const faker = new Faker({ locale: [en] })

export const generateUsers = () => {
    let products = [];
    const numOfProduct = parseInt(faker.number.int(20));
    for (let i = 0; i < numOfProduct; i++) { products.push(generateProduct()); }

    const role = parseInt(faker.number.int(1)) === 1 ? 'client': 'seller';

    return {
        id: faker.database.mongodbObjectId(),
        code: faker.string.alphanumeric(8),
        name: faker.person.firstName(),
        last_name: faker.person.lastName,
        email: faker.internet.email(),
        role: role,
        products: products
    }
}

export const generateProduct = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        stock: faker.number.int(50),
        image: faker.image.urlLoremFlickr(),
        description: faker.commerce.productDescription()
    }
}






export const generateUser = () => {
    return {
      id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.commerce.price(),
      thumbnail: faker.image.imageUrl(),
      code: faker.datatype.number(),
      stock: faker.datatype.number({ min: 0, max: 100 }),
      status: faker.datatype.boolean(),
      category: faker.commerce.department()
    };
}
