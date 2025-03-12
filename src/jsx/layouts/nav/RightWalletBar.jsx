import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Modal } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import DropdownBlog from "../../elements/DropdownBlog";
import { SVGICON } from "../../constant/theme";

import dash from "../../../assets/images/svg/dash.svg";
import btc from "../../../assets/images/svg/btc.svg";
import eth from "../../../assets/images/svg/eth.svg";
import { ThemeContext } from "../../../context/ThemeContext";
import dayjs from 'dayjs';
const options1 = [
  { value: "1", label: "Open this select menu" },
  { value: "2", label: "Bank Card" },
  { value: "3", label: "Online" },
  { value: "4", label: "Cash On Time" },
];

const RightWalletBar = () => {
  const { setHeadWallet } = useContext(ThemeContext);
  const [depositModal, setDepositModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectImage, setSelectImage] = useState([dash, "Albania"]);
  const [selectImage2, setSelectImage2] = useState([eth, "Ripple"]);
  const [orders, setOrders] = useState({ BuyOrders: [], SellOrders: [] });
  const hasFetchedRef = useRef(false);
  const token = localStorage.getItem("userDetails") || "";
  const accessToken = token ? JSON.parse(token).access : "";

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;

      const fetchAllOrders = async () => {
        try {
          const response = await axios.get(
            "https://api.quantradeai.com/oms/order/",
            { headers }
          );
          console.log(response.data);
          const Allorder= response.data.data.all;// Log the response to check the structure
          const BuyOrders = Allorder.filter(
            (order) => order.buy_sell === "BUY"
          );
          const SellOrders = Allorder.filter(
            (order) => order.buy_sell === "SELL"
          );
          setOrders({
            BuyOrders,
            SellOrders,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchAllOrders();
      return () => {
        console.log("Performing cleanup operations...");
      };
    }
  }, []);
  return (
    <>
      <div className="wallet-overlay">
        <div className="wallet-bar dlab-scroll" id="wallet-bar">
          <div className="closed-icon" onClick={() => setHeadWallet(true)}>
            <i className="fa-solid fa-xmark" />
          </div>
          <div className="wallet-card">
            <div className="wallet-wrapper">
              <div className="mb-3">
                <h5 className="fs-14 font-w400 mb-0">My Portfolio</h5>
                <h4 className="fs-24 font-w600">$34,010.00</h4>
              </div>
              <div className="text-end mb-2">
                <span>{SVGICON.WalletCardChart}</span>
                <span className="fs-14 d-block">+2.25%</span>
              </div>
            </div>
            <div className="change-btn-1">
              <Link
                to={"#"}
                className="btn btn-sm"
                onClick={() => setDepositModal(true)}
              >
                {SVGICON.DepositSvgIcon}
                Deposit
              </Link>
              <Link
                to={"#"}
                className="btn btn-sm"
                onClick={() => setPaymentModal(true)}
              >
                {SVGICON.WithdrawSvgIcon}
                withdrawal
              </Link>
            </div>
          </div>
          <div className="order-history">
            <div className="card price-list-1 mb-0">
              <div className="card-header border-0 pb-2 px-3">
                <div>
                  <h4 className="text-primary card-title mb-2">Buy Order</h4>
                </div>
                <DropdownBlog />
              </div>
              <div className="card-body p-3 py-0">
                <Dropdown className="header-drop form-control custom-image-select-2 image-select mt-3 mt-sm-0 style-1">
                  <Dropdown.Toggle as="div" className="header-drop-toggle">
                    <img src={selectImage[0]} alt="" /> {selectImage[1]}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="mt-2 menu-blog">
                    <Dropdown.Item
                      onClick={() => setSelectImage([dash, "Albania"])}
                    >
                      <img src={dash} alt="" /> Albania
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage([btc, "Dash Coin"])}
                    >
                      <img src={btc} alt="" /> Dash Coin
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage([eth, "Ripple"])}
                    >
                      <img src={eth} alt="" /> Ripple
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage([btc, "Ethereum"])}
                    >
                      <img src={btc} alt="" /> Ethereum
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <div className="table-responsive">
                  <table className="table text-center bg-primary-hover tr-rounded order-tbl mt-2 ">
                    <thead>
                      <tr>
                        <th classname="text-start">Symbol</th>
                        <th className="text-Center">Entry Price</th>
                        <th className="text-center">LTP</th>
                        <th className="text-end">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.BuyOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4">No Buy Orders</td>
                        </tr>
                      ) : (
                        orders.BuyOrders.slice(0, 7).map((order, i) => (
                          <tr key={i}>
                            <td className="text-start">{order.symbol}</td>
                            <td>{order.entry_price}</td>
                            <td>{order.LTP}</td>
                            <td className="text-end">{order.modified_at?dayjs(order.modified_at).format('MM-DD-YYYY'):""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer text-center py-2">
                <a href="/OrderTab" className="btn-link text-primary">
                  Show more <i className="fa fa-caret-right ms-2"></i>
                </a>
              </div>
            </div>
            <div className="card price-list style-2 border-top border-style">
              <div className="card-header border-0 pb-2 px-3">
                <div>
                  <h4 className="text-pink mb-2 card-title">Sell Order</h4>
                </div>
                <DropdownBlog color="btn-pink" />
              </div>
              <div className="card-body p-3 py-0">
                <Dropdown className="header-drop form-control custom-image-select-2 image-select pink-light mt-3 mt-sm-0 style-1">
                  <Dropdown.Toggle as="div" className="header-drop-toggle">
                    <img src={selectImage2[0]} alt="" /> {selectImage2[1]}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="mt-2 menu-blog">
                    <Dropdown.Item
                      onClick={() => setSelectImage2([dash, "Albania"])}
                    >
                      <img src={dash} alt="" /> Albania
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage2([btc, "Bitcoin"])}
                    >
                      <img src={btc} alt="" /> Bitcoin
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage2([eth, "Ripple"])}
                    >
                      <img src={eth} alt="" /> Ripple
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSelectImage2([btc, "Ethereum"])}
                    >
                      <img src={btc} alt="" /> Ethereum
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <div className="table-responsive">
                  <table className="table text-center bg-pink-hover tr-rounded order-tbl mt-2">
                    <thead>
                      <tr>
                        <th classname="text-start">Symbol</th>
                        <th className="text-Center">Entry Price</th>
                        <th className="text-center">LTP</th>
                        <th className="text-end">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.BuyOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4">No Buy Orders</td>
                        </tr>
                      ) : (
                        orders.SellOrders.slice(0, 7).map((order, i) => (
                          <tr key={i}>
                            <td className="text-start">{order.symbol}</td>
                            <td>{order.entry_price}</td>
                            <td>{order.LTP}</td>
                            <td className="text-end">{order.modified_at?dayjs(order.modified_at).format('MM-DD-YYYY'):""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer text-center py-2">
                <a href="/OrderTab" className="btn-link text-pink">
                  Show more <i className="fa fa-caret-right ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="wallet-bar-close"
        onClick={() => setHeadWallet(true)}
      ></div>
      <Modal centered show={depositModal} onHide={setDepositModal}>
        <div className="modal-header ">
          <h5 className="modal-title">Make Payment</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setDepositModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Seller Mobile Number</label>
            <input
              type="number"
              className="form-control mb-3"
              id="exampleInputEmail1"
              placeholder="Number"
            />
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-control mb-3"
              id="exampleInputEmail2"
              placeholder=" Name"
            />
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control mb-3"
              id="exampleInputEmail3"
              placeholder="Amount"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger light"
            onClick={() => setDepositModal(false)}
          >
            Close
          </button>
          <button type="button" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </Modal>
      <Modal show={paymentModal} onHide={setPaymentModal} centered>
        <div className="modal-header ">
          <h5 className="modal-title">Make Payment</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setPaymentModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <label className="form-label">Payment method</label>
          <div className="mb-3">
            <Select
              options={options1}
              className="custom-react-select w-100 mb-3"
              isSearchable={false}
              defaultValue={options1[1]}
            />
          </div>
          <label className="form-label">Amount</label>
          <input
            type="number"
            className="form-control mb-3"
            id="exampleInputEmail4"
            placeholder="Rupee"
          />
          <label className="form-label">Card Holder Name</label>
          <input
            type="number"
            className="form-control mb-3"
            id="exampleInputEmail5"
            placeholder="Amount"
          />
          <label className="form-label">Card Name</label>
          <input
            type="text"
            className="form-control mb-3"
            id="exampleInputEmail6"
            placeholder="Amount"
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger light"
            onClick={() => setPaymentModal(false)}
          >
            Close
          </button>
          <button type="button" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </Modal>
    </>
  );
};

export default RightWalletBar;
