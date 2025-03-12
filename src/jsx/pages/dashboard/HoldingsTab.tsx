import React, { useEffect } from "react";
import { useMemo, useRef, useState } from "react";
//MRT Imports
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_TableOptions,
  MRT_Row,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
//Material UI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  lighten,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
//Date Picker Imports - these should just be in your Context Provider
import axios from "axios";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here
import { Row, Col, Badge, Dropdown, ProgressBar } from "react-bootstrap";
import dayjs from "dayjs";
const label = { inputProps: { "aria-label": "Switch demo" } };
export type Watchlist = {
  id: string;
  created_at: string;
  ltp: any;
  order_type: string;
  instrument_token: number;
  symbol: string;
  entry_price: string;
  avg_price: any;
  lot_size_or_qty: string;
  buy_sell: any;
  status: string;
  is_intraday: boolean;
};
type OrderData = {
  symbol: string;
  instrument_token: number;
  OrderType: string;
  price: number;
  qty: number;
  version: string;
  strategy: string;
  fno_orders: string;
  equity_orders: string;
  orderSide: any;
  is_intraday: any;
};
// const UserDetailPanel = ({ row }) => {
//   const [userData, setUserData] = useState(row.original);
//   const [open, setOpen] = useState(false);
//   const [orderData, setOrderData] = useState<OrderData[]>([]);
//   const [loadingData, setLoadingData] = useState(false);

//   const handleOpenDialog = (buySell: "Buy" | "Sell", rowData: any) => {
//     const dataForDialog = {
//       symbol: rowData.symbol,
//       instrument_token: rowData.instrument_token,
//       OrderType: "Entry",
//       price: rowData.LTP,
//       qty: rowData.qty_or_lot_size,
//       version: rowData.version,
//       strategy: rowData.strategy,
//       fno_orders: rowData.fno_orders,
//       equity_orders: rowData.equity_orders,
//       orderSide: buySell,
//       is_intraday: "Intraday" as "Intraday", // Adjustable as per requirement
//     };
//     setOrderData([dataForDialog]); // Set single row data in state
//     setOpen(true); // Open the dialog
//   };

//   const handleCloseDialog = () => {
//     setOpen(false);
//   };

//   const handleOrderChange = (
//     e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
//     index: number
//   ) => {
//     const { name, value } = e.target;
//     setOrderData((prev) => {
//       const updatedData = [...prev];
//       updatedData[index] = { ...updatedData[index], [name as string]: value }; // Update specific field
//       return updatedData;
//     });
//   };

//   const handlePlaceOrder = async () => {
//     setLoadingData(true);
//     const buySell = orderData[0]?.orderSide; // Assuming all selected rows will have the same side (Buy/Sell)
//     // Prepare orders for all selected rows
//     const orders = orderData.map((data) => ({
//       LTP: data.price ?? 0,
//       instrument_token: data.instrument_token ?? 0,
//       lot_size_or_qty: data.qty ?? 0,
//       trigger_price: 0, // This can be updated based on your requirement
//       entry_price: data.price ?? 0,
//       buy_sell: buySell,
//       version: data.version ?? null,
//       strategy: data.strategy ?? null,
//       fno_orders: data.fno_orders ?? null,
//       equity_orders: data.equity_orders ?? null,
//       status: "NEW",
//       is_intraday: data.is_intraday === "Intraday" ? "true" : "false",
//     }));

//     try {
//       const response = await axios.post(
//         "https://api.quantradeai.com/oms/order/",
//         orders
//         // Include any necessary headers here
//       );
//       setLoadingData(false);
//       console.log("Orders placed successfully:", response.data);
//       swal("Success", "Orders placed successfully!", "success");
//     } catch (error) {
//       console.error("Error placing orders:", error);
//       swal("Error", "There was an error placing the orders.", "error");
//     }

//     handleCloseDialog();
//   };

//   return (
//     <>
//       <Box
//         sx={{
//           display: "flex",
//           gap: 2,
//           justifyContent: "center",
//           mt: 2,
//           margin: "0px 0px 0px 112px",
//         }}
//       >
//         <Card sx={{ flex: 1, width: "50%" }}>
//           <CardContent>
//             <Typography variant="h5" component="div" gutterBottom>
//               Order Details
//             </Typography>
//             <Box sx={{ mt: 2 }}>
//               <Grid container spacing={2}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Order Type</TableCell>
//                       <TableCell>Trigger Price</TableCell>
//                       <TableCell>Order Type</TableCell>
//                       <TableCell>Entry</TableCell>
//                       <TableCell>Stop Loss</TableCell>
//                       <TableCell>Target 1</TableCell>
//                       <TableCell>Target 2</TableCell>
//                       <TableCell>Target 3</TableCell>
//                       <TableCell>Target 4</TableCell>
//                       <TableCell>Target 5</TableCell>
//                       <TableCell>Trigger Date</TableCell>
//                       <TableCell>Action</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {userData.orders &&
//                       userData.orders.length > 0 &&
//                       userData.orders.map((x) => (
//                         <TableRow key={x.id}>
//                           <TableCell>{x.name}</TableCell>
//                           <TableCell>{x.trigger}</TableCell>
//                           <TableCell>{x.buy_sell}</TableCell>
//                           <TableCell>{x.entry}</TableCell>
//                           <TableCell>{x.stop_loss}</TableCell>
//                           <TableCell>{x.target_1}</TableCell>
//                           <TableCell>{x.target_2}</TableCell>
//                           <TableCell>{x.target_3}</TableCell>
//                           <TableCell>{x.target_4}</TableCell>
//                           <TableCell>{x.target_4}</TableCell>
//                           <TableCell>
//                             {x.triggered_at
//                               ? dayjs(x.triggered_at).format("MM-DD-YYYY")
//                               : ""}
//                           </TableCell>
//                           <TableCell>
//                             <Button
//                               onClick={() => handleOpenDialog("Buy", x)}
//                               variant="contained"
//                               color="success"
//                             >
//                               Buy
//                             </Button>
//                             <Button
//                               onClick={() => handleOpenDialog("Sell", x)}
//                               variant="contained"
//                               color="error"
//                             >
//                               Sell
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     {/* Similar map for targets and stoplosses */}
//                   </TableBody>
//                 </Table>
//               </Grid>
//             </Box>
//           </CardContent>
//         </Card>
//       </Box>

//       <Dialog open={open} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           {orderData.length > 1
//             ? "Place Orders"
//             : `${orderData[0]?.orderSide} Order`}
//         </DialogTitle>
//         <DialogContent>
//           {orderData.map((order, index) => (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginBottom: "16px",
//                 padding: "16px",
//                 borderRadius: "8px",
//                 backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
//                 boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//                 gap: "16px",
//               }}
//             >
//               <TextField
//                 label="Symbol"
//                 value={order.symbol}
//                 disabled
//                 required
//                 InputLabelProps={{ shrink: true }}
//                 style={{ minWidth: "150px" }}
//               />
//               <TextField
//                 label="Order Type"
//                 value={order.OrderType}
//                 disabled
//                 required
//                 InputLabelProps={{ shrink: true }}
//                 style={{ minWidth: "150px" }}
//               />
//               <TextField
//                 label="Price"
//                 type="number"
//                 name="price"
//                 value={order.price}
//                 onChange={(e: any) => handleOrderChange(e, index)}
//                 required
//                 InputLabelProps={{ shrink: true }}
//                 style={{ minWidth: "150px" }}
//               />
//               <TextField
//                 label="Quantity"
//                 type="number"
//                 name="qty"
//                 value={order.qty}
//                 onChange={(e: any) => handleOrderChange(e, index)}
//                 required
//                 InputLabelProps={{ shrink: true }}
//                 style={{ minWidth: "150px" }}
//               />
//               <FormControl variant="outlined" style={{ minWidth: "150px" }}>
//                 <InputLabel>Order Type</InputLabel>
//                 <Select
//                   value={order.is_intraday}
//                   onChange={(e: any) => handleOrderChange(e, index)}
//                   label="Order Type"
//                   name="is_intraday"
//                 >
//                   <MenuItem value="Intraday">Intraday</MenuItem>
//                   <MenuItem value="Positional">Positional</MenuItem>
//                 </Select>
//               </FormControl>
//             </div>
//           ))}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button
//             onClick={handlePlaceOrder}
//             color="success"
//             variant="contained"
//             disabled={loadingData}
//           >
//             {loadingData ? <CircularProgress size={24} /> : "Place Order"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };
const Equity = (_data) => {
  const data = _data.data;
  const [open, setOpen] = useState(false);
  const [orderData, setOrderData] = useState<any>([]);
  const [loadingData, setloadingData] = useState(false);
  const token = localStorage.getItem("userDetails") || "";
    const[filterBuySell,SetfilterBuySell]=useState("All");
  
  const accessToken = token ? JSON.parse(token).access : "";
  const headers = {
    Authorization: "Bearer " + accessToken,
  };
  function roundToNearestFiveCents(amount: number): number {
    return Math.round(amount * 20) / 20;
  }
  const [columnVisibility, setColumnVisibility] = React.useState({
    id: false, // Initially hide the "age" column
  });
  const [orderTypeFilter, setOrderTypeFilter] = React.useState("");
  const filteredData = data.filter((row) => {
    if (filterBuySell === "BUY") {
      return row.buy_sell === "BUY";
    } else if (filterBuySell === "SELL") {
      return row.buy_sell === "SELL";
    }
    return true;
  });
  const columns = useMemo<MRT_ColumnDef<Watchlist>[]>(
    () => [
      {
        accessorFn: (row) => `${row.symbol}`, //accessorFn used to join multiple data into a single cell
        id: "symbol", //id is still required when using accessorFn instead of accessorKey
        header: "Symbol",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.lot_size_or_qty}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "QTY",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.avg_price ?? row.entry_price}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "Avg Price",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.ltp ?? 0}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "LTP",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.buy_sell}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: "Order Type",
        size: 100,
        Cell: ({ row }) => (
          <>
            {row.original.buy_sell == "BUY" ? (
              <Button
                variant="contained"
                style={{ borderRadius: "17px" }}
                color="success"
              >
                {" "}
                Buy{" "}
              </Button>
            ) : (
              <Button
                variant="contained"
                style={{ borderRadius: "17px" }}
                color="error"
              >
                {" "}
                Sell{" "}
              </Button>
            )}
          </>
        ),
      },
      {
        accessorFn: (row) =>
          `${roundToNearestFiveCents(row.buy_sell == "BUY" ? (row.ltp ?? 0) - (row.avg_price ?? 0) : (row.avg_price ?? 0) - (row.ltp ?? 0))}`,
        header: "P&L",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) =>
          `${roundToNearestFiveCents((((row.ltp ?? 0) - (row.avg_price ?? 0)) / (row.ltp ?? 0)) * 100)}`,
        header: "% Change",
        size: 50,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => (row.is_intraday ? "Intraday" : "Positional"),
        header: "Intraday/Positional",
        size: 100,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        id: "actions", // Define a unique ID for the action column
        header: "Actions",
        enableEditing: false,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => handleOpenDialog("Buy", row)}
            >
              Buy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleOpenDialog("Sell", row)}
            >
              Sell
            </Button>
          </Box>
        ),
      },
    ],
    []
  );
  const handleOpenDialog = (buySell: "Buy" | "Sell", row?: any) => {
    const selectedRows = row
      ? [row]
      : table_is_superuser.getSelectedRowModel()?.rows || [];

    // If single row is selected, populate data
    if (selectedRows.length === 1) {
      const dataForDialog = selectedRows.map((row) => ({
        symbol: row.original.symbol,
        instrument_token: row.original.instrument_token,
        OrderType: "Entry",
        price: row.original.ltp,
        qty: row.original.lot_size_or_qty,
        version: row.original.version,
        strategy: row.original.strategy,
        fno_orders: row.original.fno_orders,
        equity_orders: row.original.equity_orders,
        orderSide: buySell,
        is_intraday: "Intraday", // Can adjust this as per your requirement
      }));
      setOrderData(dataForDialog); // Set single row data in state
    }
    // If multiple rows are selected, populate data for each selected row
    else if (selectedRows.length > 1) {
      const dataForDialog = selectedRows.map((row) => ({
        symbol: row.original.symbol,
        instrument_token: row.original.instrument_token,
        OrderType: "Entry",
        price: row.original.ltp,
        qty: row.original.lot_size_or_qty,
        version: row.original.version,
        strategy: row.original.strategy,
        fno_orders: row.original.fno_orders,
        equity_orders: row.original.equity_orders,
        orderSide: buySell,
        is_intraday: "Intraday", // Adjust according to your requirement
      }));
      setOrderData(dataForDialog); // Set multiple rows data in state
    }

    setOpen(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    setOrderData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = { ...updatedData[index], [name]: value }; // Update specific field
      return updatedData;
    });
  };
  const handlePlaceOrder = async () => {
    setloadingData(true);
    const buySell = orderData[0]?.orderSide; // Assuming all selected rows will have the same side (Buy/Sell)
    // Prepare orders for all selected rows
    const orders = orderData.map((data) => ({
      LTP: data.price ?? 0,
      instrument_token: data.instrument_token ?? 0,
      lot_size_or_qty: data.qty ?? 0,
      trigger_price: 0, // This can be updated based on your requirement
      entry_price: data.price ?? 0,
      buy_sell: buySell,
      version: data.version ?? null,
      strategy: data.strategy ?? null,
      fno_orders: data.fno_orders ?? null,
      equity_orders: data.equity_orders ?? null,
      status: "NEW",
      is_intraday: data.is_intraday == "Intraday" ? "true" : "false",
    }));

    try {
      const response = await axios.post(
        "https://api.quantradeai.com/oms/order/",
        orders,
        { headers }
      );
      setloadingData(false);
      console.log("Orders placed successfully:", response.data);
      swal("Success", "Orders placed successfully!", "success");
    } catch (error) {
      console.error("Error placing orders:", error);
      swal("Error", "There was an error placing the orders.", "error");
    }

    handleCloseDialog();
  };
  const table_is_superuser = useMaterialReactTable({
    columns,
    data,
    editDisplayMode: "cell",
    muiTableContainerProps: { sx: { minHeight: "500px" } },
    enableColumnOrdering: true,
    enableRowSelection: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    // renderDetailPanel: ({ row }) => {
    //   return <UserDetailPanel row={row} />;
    // },
    muiTableBodyCellProps: ({ cell, column, table }) => ({
      onClick: () => {
        table.setEditingCell(cell);
        queueMicrotask(() => {
          const textField = table.refs.editInputRefs.current?.[column.id];
          if (textField) {
            textField.focus();
            textField.select?.();
          }
        });
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}
      >
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleOpenDialog("Buy")}
          variant="contained"
          color="success"
        >
          Buy
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleOpenDialog("Sell")}
          variant="contained"
          color="error"
        >
          Sell
        </Button>

      </Box>
    ),
    state: {
      isLoading: data && data.length >= 0 ? false : true, // Set loading state for MaterialReactTable
      columnVisibility,
    },
  });
  return (
    <>
      <MaterialReactTable table={table_is_superuser} />
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {orderData?.length > 1
            ? "Place Orders"
            : `${orderData[0]?.orderSide} Order`}
        </DialogTitle>
        <DialogContent>
          {Array.isArray(orderData) &&
            orderData.map((order, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row", // All fields in one row
                  alignItems: "center", // Align items vertically in the center
                  marginBottom: "16px", // Space between orders
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  gap: "16px", // Space between fields
                }}
              >
                {/* Symbol */}
                <TextField
                  label="Symbol"
                  value={order.symbol}
                  disabled
                  required
                  InputLabelProps={{ shrink: true }}
                  style={{ minWidth: "150px" }}
                />

                {/* Order Type */}
                <FormControl variant="outlined" style={{ minWidth: "150px" }}>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={order.OrderType}
                    onChange={(e: any) => handleOrderChange(e, index)}
                    label="Order Type"
                    name="OrderType"
                  >
                    <MenuItem value="Entry">Entry</MenuItem>
                    <MenuItem value="SL">SL</MenuItem>
                    <MenuItem value="Target">Target</MenuItem>
                  </Select>
                </FormControl>

                {/* Price */}
                <TextField
                  label="Price"
                  type="number"
                  name="price"
                  value={order.price}
                  onChange={(e: any) => handleOrderChange(e, index)}
                  required
                  InputLabelProps={{ shrink: true }}
                  style={{ minWidth: "150px" }}
                />

                {/* Quantity */}
                <TextField
                  label="Quantity"
                  type="number"
                  name="qty"
                  value={order.qty}
                  onChange={(e: any) => handleOrderChange(e, index)}
                  required
                  InputLabelProps={{ shrink: true }}
                  style={{ minWidth: "150px" }}
                />

                {/* Order Type (Intraday/Positional) */}
                <FormControl variant="outlined" style={{ minWidth: "150px" }}>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={order.is_intraday}
                    onChange={(e: any) => handleOrderChange(e, index)}
                    label="Order Type"
                    name="is_intraday"
                  >
                    <MenuItem value="Intraday">Intraday</MenuItem>
                    <MenuItem value="Positional">Positional</MenuItem>
                  </Select>
                </FormControl>
              </div>
            ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handlePlaceOrder}
            color="success"
            variant="contained"
            disabled={loadingData}
          >
            {loadingData ? <CircularProgress size={24} /> : "Place Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
// Main application component
const App = () => {
  const [orders, setOrders] = useState({ net_positions: [], holdings: [] }); // State for storing user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
  const [value, setValue] = React.useState("1");
  const token = localStorage.getItem("userDetails") || ""; // Provide a fallback to an empty string
  const accessToken = token ? JSON.parse(token).access : "";

  const headers = {
    Authorization: "Bearer " + accessToken,
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      setLoading(true);
      hasFetchedRef.current = true;

      const fetchAllOrders = async () => {
        try {
          const response = await axios.get(
            "https://api.quantradeai.com/oms/holdings/positions//",
            { headers }
          );
          setOrders(response.data.data);
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log("Request canceled:", error.message);
          } else {
            console.error("Error fetching data:", error);
          }
        } finally {
          setLoading(false); // End loading after the request completes
        }
      };

      fetchAllOrders();
      return () => {
        console.log("Performing cleanup operations...");
      };
    }
  }, []); // Empty dependency array means this effect runs once (componentDidMount)

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      {loading ? (
        <p>Loading...</p> // Show loading text while data is being fetched
      ) : (
        <>
          <div className="row main-card">
            <div className="swiper mySwiper-counter position-relative overflow-hidden">
              <div className="swiper-wrapper">
                {/* First Slide */}
                <div
                  className="swiper-slide"
                  style={{ width: "250px", gap: "2rem" }}
                >
                  <div className="card card-box bg-secondary">
                    <div className="card-header border-0 pb-0">
                      <div className="chart-num">
                        <p>
                          <i className="fa-solid fa-sort-down me-2"></i>Total
                          Investment
                        </p>
                        <h2 className="font-w600 mb-0">₹65,123</h2>
                      </div>
                      <div className="dlab-swiper-circle">
                        <svg
                          width="50"
                          height="45"
                          viewBox="0 0 137 137"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M68.5 0C30.6686 0 0 30.6686 0 68.5C0 106.331 30.6686 137 68.5 137C106.331 137 137 106.331 137 68.5C136.958 30.6865 106.313 0.0418093 68.5 0ZM40.213 63.6068H59.7843C62.4869 63.6068 64.6774 65.7973 64.6774 68.5C64.6774 71.2027 62.4869 73.3932 59.7843 73.3932H40.213C37.5104 73.3932 35.3199 71.2027 35.3199 68.5C35.3199 65.7973 37.5119 63.6068 40.213 63.6068ZM101.393 56.6456L95.5088 86.0883C94.1231 92.9226 88.122 97.8411 81.1488 97.8576H40.213C37.5104 97.8576 35.3199 95.6671 35.3199 92.9644C35.3199 90.2617 37.5119 88.0712 40.213 88.0712H81.1488C83.4617 88.0652 85.4522 86.4347 85.9121 84.168L91.7982 54.7253C92.3208 52.0973 90.6156 49.544 87.9891 49.0214C87.677 48.9601 87.3605 48.9288 87.0439 48.9288H49.9994C47.2967 48.9288 45.1062 46.7383 45.1062 44.0356C45.1062 41.3329 47.2967 39.1424 49.9994 39.1424H87.0439C95.128 39.1454 101.679 45.699 101.677 53.7831C101.677 54.7433 101.582 55.7019 101.393 56.6456Z"
                            fill="#FFF"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div id="widgetChart1" className="chart-primary">
                        {/* Chart content goes here */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Slide */}
                <div className="swiper-slide" style={{ width: "250px" }}>
                  <div className="card card-box bg-secondary">
                    <div className="card-header border-0 pb-0">
                      <div className="chart-num">
                        <p>
                          <i className="fa-solid fa-sort-down me-2"></i>Current
                          Value
                        </p>
                        <h2 className="font-w600 mb-0">₹65,123</h2>
                      </div>
                      <div className="dlab-swiper-circle">
                        <svg
                          width="50"
                          height="45"
                          viewBox="0 0 137 137"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M68.5 0C30.6686 0 0 30.6686 0 68.5C0 106.331 30.6686 137 68.5 137C106.331 137 137 106.331 137 68.5C136.958 30.6865 106.313 0.0418093 68.5 0ZM40.213 63.6068H59.7843C62.4869 63.6068 64.6774 65.7973 64.6774 68.5C64.6774 71.2027 62.4869 73.3932 59.7843 73.3932H40.213C37.5104 73.3932 35.3199 71.2027 35.3199 68.5C35.3199 65.7973 37.5119 63.6068 40.213 63.6068ZM101.393 56.6456L95.5088 86.0883C94.1231 92.9226 88.122 97.8411 81.1488 97.8576H40.213C37.5104 97.8576 35.3199 95.6671 35.3199 92.9644C35.3199 90.2617 37.5119 88.0712 40.213 88.0712H81.1488C83.4617 88.0652 85.4522 86.4347 85.9121 84.168L91.7982 54.7253C92.3208 52.0973 90.6156 49.544 87.9891 49.0214C87.677 48.9601 87.3605 48.9288 87.0439 48.9288H49.9994C47.2967 48.9288 45.1062 46.7383 45.1062 44.0356C45.1062 41.3329 47.2967 39.1424 49.9994 39.1424H87.0439C95.128 39.1454 101.679 45.699 101.677 53.7831C101.677 54.7433 101.582 55.7019 101.393 56.6456Z"
                            fill="#FFF"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div id="widgetChart2" className="chart-primary">
                        {/* Chart content goes here */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide" style={{ width: "250px" }}>
                  <div className="card card-box bg-secondary">
                    <div className="card-header border-0 pb-0">
                      <div className="chart-num">
                        <p>
                          <i className="fa-solid fa-sort-down me-2"></i>Day P&L
                        </p>
                        <h2 className="font-w600 mb-0">₹65,123</h2>
                      </div>
                      <div className="dlab-swiper-circle">
                        <svg
                          width="50"
                          height="45"
                          viewBox="0 0 137 137"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M68.5 0C30.6686 0 0 30.6686 0 68.5C0 106.331 30.6686 137 68.5 137C106.331 137 137 106.331 137 68.5C136.958 30.6865 106.313 0.0418093 68.5 0ZM40.213 63.6068H59.7843C62.4869 63.6068 64.6774 65.7973 64.6774 68.5C64.6774 71.2027 62.4869 73.3932 59.7843 73.3932H40.213C37.5104 73.3932 35.3199 71.2027 35.3199 68.5C35.3199 65.7973 37.5119 63.6068 40.213 63.6068ZM101.393 56.6456L95.5088 86.0883C94.1231 92.9226 88.122 97.8411 81.1488 97.8576H40.213C37.5104 97.8576 35.3199 95.6671 35.3199 92.9644C35.3199 90.2617 37.5119 88.0712 40.213 88.0712H81.1488C83.4617 88.0652 85.4522 86.4347 85.9121 84.168L91.7982 54.7253C92.3208 52.0973 90.6156 49.544 87.9891 49.0214C87.677 48.9601 87.3605 48.9288 87.0439 48.9288H49.9994C47.2967 48.9288 45.1062 46.7383 45.1062 44.0356C45.1062 41.3329 47.2967 39.1424 49.9994 39.1424H87.0439C95.128 39.1454 101.679 45.699 101.677 53.7831C101.677 54.7433 101.582 55.7019 101.393 56.6456Z"
                            fill="#FFF"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div id="widgetChart2" className="chart-primary">
                        {/* Chart content goes here */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide" style={{ width: "250px" }}>
                  <div className="card card-box bg-secondary">
                    <div className="card-header border-0 pb-0">
                      <div className="chart-num">
                        <p>
                          <i className="fa-solid fa-sort-down me-2"></i>Total
                          P&L
                        </p>
                        <h2 className="font-w600 mb-0">₹65,123</h2>
                      </div>
                      <div className="dlab-swiper-circle">
                        <svg
                          width="50"
                          height="45"
                          viewBox="0 0 137 137"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M68.5 0C30.6686 0 0 30.6686 0 68.5C0 106.331 30.6686 137 68.5 137C106.331 137 137 106.331 137 68.5C136.958 30.6865 106.313 0.0418093 68.5 0ZM40.213 63.6068H59.7843C62.4869 63.6068 64.6774 65.7973 64.6774 68.5C64.6774 71.2027 62.4869 73.3932 59.7843 73.3932H40.213C37.5104 73.3932 35.3199 71.2027 35.3199 68.5C35.3199 65.7973 37.5119 63.6068 40.213 63.6068ZM101.393 56.6456L95.5088 86.0883C94.1231 92.9226 88.122 97.8411 81.1488 97.8576H40.213C37.5104 97.8576 35.3199 95.6671 35.3199 92.9644C35.3199 90.2617 37.5119 88.0712 40.213 88.0712H81.1488C83.4617 88.0652 85.4522 86.4347 85.9121 84.168L91.7982 54.7253C92.3208 52.0973 90.6156 49.544 87.9891 49.0214C87.677 48.9601 87.3605 48.9288 87.0439 48.9288H49.9994C47.2967 48.9288 45.1062 46.7383 45.1062 44.0356C45.1062 41.3329 47.2967 39.1424 49.9994 39.1424H87.0439C95.128 39.1454 101.679 45.699 101.677 53.7831C101.677 54.7433 101.582 55.7019 101.393 56.6456Z"
                            fill="#FFF"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div id="widgetChart2" className="chart-primary">
                        {/* Chart content goes here */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Box mb={2} sx={{ backgroundColor: "white" }}>
            <Equity data={orders.holdings} />
          </Box>
        </>
      )}
    </>
  );
};
const queryClient = new QueryClient();

const HoldingsTab = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};
export default HoldingsTab;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error("Function not implemented.");
}
