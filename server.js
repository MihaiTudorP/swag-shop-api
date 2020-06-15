var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/swag-shop',
    { useNewUrlParser: true,
    useUnifiedTopology: true });

var Product = require('./model/product');
var Wishlist = require('./model/wishlist');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.post('/product', function(request, response){
    var product = new Product(request.body);
    product.save(function(err, savedProduct){
        if (err){
            response.status(500).send({error: "Could not save product"});
        } else {
            response.send(savedProduct);
        }
    })
});

app.get('/product', (req, res)=>{
    Product.find((err, listProducts)=>{
        if(err){
            res.status(500).send({error: "Could not get the products"});
        } else {
            res.send(listProducts);
        }
    });

});

app.get('/product/:id', (req, res)=>{
    var id = req.params.id;
    Product.findOne({"_id" :id}, (err, product)=>{
        if (err){
            res.status(500).send({error: "Could not get the product"});
        } else {
            res.send(product);
        }
    });

});

app.post('/wishlist', (req, res)=>{
    var wishlist = new Wishlist(req.body);
    wishlist.save((err, newWishList)=>{
        if (err){
            response.status(500).send({error: "Could not save wishlist"});
        } else {
            res.send(newWishList);
        }
    });
});

app.get('/wishlist', (req, res)=>{
    Wishlist.find({}).populate({path: 'products', model: 'Product'}).exec((err, wishlists)=>{
        if(err){
            res.status(500).send({error: "Could not get the wishlists"});
        } else {
            res.send(wishlists);
        }
    });

});

app.put('/wishlist/product/add', (req, res)=>{
    Product.findOne({_id: req.body.productId}, (err, product)=>{
        if (err) {
            sendWishlistAddProductError(res);
        } else {
            Wishlist.update({_id: req.body.wishlistId}, {$addToSet: {products: product._id}}, function(err, dbResponse){
                if (err){
                    sendWishlistAddProductError(res);
                } else{
                    res.send(dbResponse);
                }
            });
        }
    })
});

const port = 3004;

app.listen(port, function(){
    console.log(`Swag shop API running on port ${port}...`);
});

function sendWishlistAddProductError(response) {
    response.status(500).send({ error: "Could not add item to wishlist." });
}
