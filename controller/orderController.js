const Order = require('../model/OrderModel')
const OrderItems = require('../model/OrderItemsModel')

// place order
exports.placeOrder = async (req, res) => {
    let orderitemsids = await Promise.all(
        req.body.orderItems.map(async (orderitem) => {
            let orderItem = new OrderItems({
                product: orderitem.product,
                quantity: orderitem.quantity
            })
            orderItem = await orderItem.save()
            if(!orderItem){
                return res.status(400).json({error: "Something went wrong"})
            }
            return orderItem._id
        })
    )

    let individual_total = await Promise.all(
        orderitemsids.map(async (orderitem) => {
            let item = await OrderItems.findById(orderitem).populate('product', 'product_price')
            return item.product.product_price * item.quantity
        })
    )

    let total_price = individual_total.reduce((acc,cur)=> acc + cur)

    let order = new Order({
        orderItemsIds: orderitemsids,
        total: total_price,
        user: req.body.user,
        shipping_address: req.body.shipping_address,
        alternate_shipping_address: req.body.alternate_shipping_address,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone
    })

    order = await order.save()
    if(!order){
        return res.status(400).json({error: "Something went wrong"})
    }
    res.send(order)

}
/*
[abc - 5    // ABC
def - 3]    // DEF
[111, 222 , 333, 444 , 555 ]
acc  - 111, 333, 666, 1110
cur - 222, 333, 444, 555
acc+cur - 333, 666, 1110, 1665
*/

// to view all orders
exports.viewOrders = async (req, res) => {
    let orders = await Order.find().populate('user','username')
    .populate({path:"orderItemsIds", populate:({path:"product", populate:({path:"category"})})})
    if(!orders){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(orders)
}

// to view order details
exports.orderDetails = async (req, res) => {
    let order = await Order.findById(req.params.order_id).populate('user','username')
    .populate({path:"orderItemsIds", populate:({path:"product", populate:({path:"category"})})})
    if(!order){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(order)
}

// to view user orders
exports.userOrders = async (req, res) => {
    let orders = await Order.find({user: req.params.user_id}).populate('user','username')
    .populate({path:"orderItemsIds", populate:({path:"product", populate:({path:"category"})})})
    if(!orders){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(orders)
}

// to view orders by status
exports.findOrdersByStatus = async (req, res) => {
    let orders = await Order.find({status: req.body.status}).populate('user','username')
    .populate({path:"orderItemsIds", populate:({path:"product", populate:({path:"category"})})})
    if(!orders){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(orders)
}

// update order
exports.updateOrder = async (req, res) => {
    let order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    },{new:true})
    if(!order){
        return res.status(400).json({error: "Something went wrong"})
    }
    res.send(order)
}

// delete order
exports.deleteOrder = (req, res) => {
    Order.findByIdAndDelete(req.params.id)
    .then(order=>{
        if(order==null){
            return res.status(400).json({error:"Order not found"})
        }
        order.orderItemsIds.map(async (orderItem)=>{
            let OrderItem = await OrderItems.findByIdAndRemove(orderItem)
            if(!OrderItem){
                return res.status(400).json({error:"Something went wrong"})
            }
        })
        return res.status(200).json({message:"Order deleted"})
    })
    .catch(err=>res.status(400).json({error:err}))
}
