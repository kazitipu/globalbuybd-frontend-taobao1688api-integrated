import React, {Component} from 'react';
import {Helmet} from 'react-helmet'
import { connect } from 'react-redux'
import {Link, Redirect } from 'react-router-dom'
import PaypalExpressBtn from 'react-paypal-express-checkout';
import SimpleReactValidator from 'simple-react-validator';

import Breadcrumb from "../common/breadcrumb";
import {removeFromWishlist, removeCart,setOrderObj} from '../../actions'
import {auth,removeAllCartItemFromFirestore,addCartItemsToOrdersFirestore, removeCartItemFromFirestore,uploadImage,uploadPayment} from '../../firebase/firebase.utils'

import {getCartTotal} from "../../services";


class checkOut extends Component {

    constructor (props) {
        super (props)

        this.state = {
            first_name:'',
            last_name:'',
            phone:'',
            email:'',
            city:'',
            address:'',
        }
        this.validator = new SimpleReactValidator();
    }

    componentDidMount=()=>{
        const {currentUser} = this.props
        if (currentUser && currentUser.shippingAddress){
            this.mapShippingInformationToState(currentUser.shippingAddress)
        }
    }

    setStateFromInput = (event) => {
        var obj = {};
        obj[event.target.name] = event.target.value;
        this.setState(obj);

      }

    setStateFromCheckbox = (event) => {
          var obj = {};
          obj[event.target.name] = event.target.checked;
          this.setState(obj);

          if(!this.validator.fieldValid(event.target.name))
          {
              this.validator.showMessages();
          }
        }

    checkhandle(value) {
        this.setState({
            payment: value
        })
    }

    removeFromCartAndAddToOrders=(cartItems) =>{
        const {removeCart,history}= this.props;
        auth.onAuthStateChanged(async (userAuth) =>{
            const orderObj = await addCartItemsToOrdersFirestore(userAuth,cartItems,this.state)
            this.props.setOrderObj(orderObj)
        }
            )

        auth.onAuthStateChanged(async userAuth=>await removeAllCartItemFromFirestore(userAuth,cartItems))
        removeCart()
        
        history.push({
            pathname: '/order-success',
        })
      
    }

    mapShippingInformationToState =(shippingInformation)=>{
       this.setState({
        first_name:shippingInformation.first_name,
        last_name:shippingInformation.last_name,
        phone:shippingInformation.phone,
        email:shippingInformation.email,
        city:shippingInformation.city,
        address:shippingInformation.address,
       })
    }

   

    render (){
        const {cartItems, symbol, total,currentUser} = this.props;
       

        return (
            <div>

                {/*SEO Support*/}
                <Helmet>
                    <title>GlobalbuyBd | CheckOut Page</title>
                    <meta name="description" content="GlobalbuyBd – A global e-commerce platform for every smart shoppers" />
                </Helmet>
                {/*SEO Support End */}

                <Breadcrumb  title={'Checkout'}/>
                <section className="section-b-space">
                    <div className="container padding-cls">
                        <div className="checkout-page">
                            <div className="checkout-form">
                                <form>
                                    <div className="checkout row">
                                        <div className="col-lg-6 col-sm-12 col-xs-12">
                                            <div className="checkout-title">
                                                <h3>Shipping Information</h3>
                                            </div>
                                            <div className="row check-out">
                                                <div className="form-group col-md-6 col-sm-6 col-xs-12">
                                                    <div className="field-label">First Name</div>
                                                    <input type="text" name="first_name" value={this.state.first_name} onChange={this.setStateFromInput} />
                                                    {this.validator.message('first_name', this.state.first_name, 'required|alpha')}
                                                </div>
                                                <div className="form-group col-md-6 col-sm-6 col-xs-12">
                                                    <div className="field-label">Last Name</div>
                                                    <input type="text" name="last_name" value={this.state.last_name} onChange={this.setStateFromInput} />
                                                    {this.validator.message('last_name', this.state.last_name, 'required|alpha')}
                                                </div>
                                                <div className="form-group col-md-6 col-sm-6 col-xs-12">
                                                    <div className="field-label">Phone</div>
                                                    <input type="text" name="phone"  value={this.state.phone} onChange={this.setStateFromInput} />
                                                    {this.validator.message('phone', this.state.phone, 'required|phone')}
                                                </div>
                                                <div className="form-group col-md-6 col-sm-6 col-xs-12">
                                                    <div className="field-label">Email Address</div>
                                                    <input type="text" name="email" value={this.state.email} onChange={this.setStateFromInput} />
                                                    {this.validator.message('email', this.state.email, 'required|email')}
                                                </div>
                                                <div className="form-group col-md-12 col-sm-12 col-xs-12">
                                                    <div className="field-label">Town/City</div>
                                                    <input type="text" name="city" value={this.state.city} onChange={this.setStateFromInput} />
                                                    {this.validator.message('city', this.state.city, 'required|alpha')}
                                                </div>
                                                <div className="form-group col-md-12 col-sm-12 col-xs-12">
                                                    <div className="field-label">Address</div>
                                                    <input type="text" name="address" value={this.state.address} onChange={this.setStateFromInput} placeholder="Street address" />
                                                    {this.validator.message('address', this.state.address, 'required|min:20|max:120')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-sm-12 col-xs-12">
                                            <div className="checkout-details">
                                                <div className="order-box">
                                                    <div className="title-box">
                                                        <div>Product <span> Total</span></div>
                                                    </div>
                                                    <ul className="qty">
                                                        {cartItems.map((item, index) => {
                                                            return <li key={index}>{item.name} × {item.qty} <span>{symbol} {item.sum}</span></li> })
                                                        }
                                                    </ul>
                                                  

                                                    <ul className="total">
                                                        <li>Total <span className="count">{symbol}{total}</span></li>
                                                    </ul>
                                                </div>

                                                <div className="payment-box">
                                                    {(total !== 0)?
                                                    <div className="text-right">
                                                         <button type="button" className="btn-solid btn" onClick={()=>this.removeFromCartAndAddToOrders(cartItems)}>Proceed to Pay</button>
                                                    </div>
                                                    : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row section-t-space">
                                        {
                                            cartItems.map((item,index) =>{
                                 return(<div className="col-lg-6" key={index}>
                                            <div className="stripe-section">
                                                <h5><img style={{'width':'25%'}} src={item.colorUrl?item.colorUrl:item.pictures[0]} alt={item.name} /></h5>
                                                <div>
                                                    <p className="checkout_class">{item.name}</p>
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <td>quantity</td>
                                                                <td>{item.qty}</td>
                                                            </tr>
                                                            <tr>
                                                                {
                                                                    item.color? <> <td>color</td> <td>{item.color}</td> </>:''
                                                                }
                                                            </tr>
                                                            <tr>
                                                                {
                                                                    item.sizeOrShipsFrom? <> <td>sizeOrShipsFrom</td> <td>{item.sizeOrShipsFrom}</td> </>:''
                                                                }    
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>)})
                                        } 
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    cartItems: state.cartList.cart,
    symbol: state.data.symbol,
    total: getCartTotal(state.cartList.cart)
})

export default connect(
    mapStateToProps,
    {removeFromWishlist, removeCart ,setOrderObj}
)(checkOut)