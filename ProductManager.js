import  fs  from 'fs'
import productModel from './dao/models/products.model';

class ProductManager {

    constructor (path) {
        this.products = []
        this.path =path;
     }

     #getId(){
        if(this.products.length === 0) return 1 
        return this.products.length + 1
    }

   async getProducts(){
        try{
         // const datos = await fs.promises.readFile(this.path,'utf-8' );
          const products= await productModel.find()
          console.log(products);
        }catch(error){
          console.log("error!!");
          return;
        }
    }

    addProduct(title,description,price,thumbnail,code,stock,status,category){
       
        if( !title || !description || !price  || !stock || !status ||!category){
          console.log("Error: Debe completar todos los campos");
          return; 
        }

       const enc = this.products.some(product =>product.code === code) 
       if(enc){
        console.log(`Ya existe producto con mismo código ${code}`)
       }

       const nuevoProduct={
        id: this.#getId(),
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status:true,
        category
    }
    this.products.push(nuevoProduct)
    console.log("Se agrego producto");
    fs.writeFile(this.path, JSON.stringify(this.products), (error) =>{
      if(error) throw error;
      console.log("Se guardo archivo")

    })
   
    }
 
 async getProductById(idProduct){
  const datos = await fs.promises.readFile(this.path,'utf-8');
  const productById= JSON.parse(datos);

  const IdProductExist = productById.find((product) => product.id === idProduct)
    console.log(IdProductExist ? IdProductExist :"Not Found")
  }

  async updateProduct(idProduct,campo,actualizacion){
    const datos = await fs.promises.readFile(this.path,'utf-8' );
    const products= JSON.parse(datos);

    const indice = products.findIndex((product)=>product.id === idProduct)
    if(indice === -1){
      console.log("No hay producto")
      return;
     
    }
    products[indice] [campo] = actualizacion;

    fs.writeFile(this.path, JSON.stringify(products), error =>{
      if(error) throw error;
      console.log("El producto fue actualizado")

      
    })
  }

 async deleteProduct(borrarId){
  const datos = await fs.promises.readFile(this.path,'utf-8' );
  const products= JSON.parse(datos);

  const borrarItemConFilter = products.filter((product )=>product.id != borrarId)

  if( borrarItemConFilter.length === products.length){
    console.log(`No se encontro producto con ese ID  ${borrarId}`)
    return;
  }

  fs.writeFile(this.path, JSON.stringify(borrarItemConFilter), error =>{
    if(error) throw error;
    console.log("El producto fue eliminado")

    
  })

 }

}


export {getProducts, getProductById, addProduct, updateProduct, deleteProduct};
