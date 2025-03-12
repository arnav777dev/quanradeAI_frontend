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
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  lighten,
  MenuItem,
  Select,
  Tab,
  TextField,
  Tooltip,
} from "@mui/material";
//Date Picker Imports - these should just be in your Context Provider
import axios from "axios";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here
import { Badge } from "react-bootstrap";
import swal from "sweetalert";
const label = { inputProps: { "aria-label": "Switch demo" } };
interface Equity {
  id: string;
  FromEquity: string;
  symbol: string;
  LTP: number; // Correct the name to lowercase ltp
  version: string;
  instrument_token: string;
  strategy: string;
  trade_status: string;
  ath: number;
  ath_date: string;
  cc_date: string;
  entry_date: string;
  Changed: string;
  entries: { trigger: number; quantity: number }[];
  status?: string;
  is_active: string; // If 'status' is optional
  trigger_price?: number; // If 'trigger_price' is optional
  qty_or_lot_size?: any;
  trigger?: number;
  fno_orders?: any;
  equity_orders?: any;
}
const Equity = (_data) => {
  const data = _data.data;
  const token = localStorage.getItem("userDetails") || "";
  const accessToken = token ? JSON.parse(token).access : "";
  const headers = {
    Authorization: "Bearer " + accessToken,
  };
  const [columnVisibility, setColumnVisibility] = React.useState({ id: false });
  const [open, setOpen] = useState(false);
  const [orderData, setOrderData] = useState<any>([]);
  const [loadingData, setloadingData] = useState(false);
  const columns = useMemo<MRT_ColumnDef<Equity>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
        enableHiding: false,
      },
      {
        accessorFn: (row) => `${row.symbol}`, //accessorFn used to join multiple data into a single cell
        id: "symbol", //id is still required when using accessorFn instead of accessorKey
        header: "Symbol",
        size: 100,
        enableEditing: false,
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
        accessorFn: (row) => `${row.version ?? row.strategy}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "Strategy",
        size: 100,
        enableEditing: false,
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
        accessorFn: (row) => `${row.trigger_price ?? row.trigger ?? 0}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "Entry price",
        size: 100,
        enableEditing: false,
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
        accessorFn: (row) => `${row.LTP}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically

        header: "LTP",
        size: 100,
        enableEditing: false,
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
        accessorFn: (row) => `${row.is_active}`,
        header: "Trade Status",
        size: 100,
        enableEditing: false,
        Cell: ({ row }) => (
          <>
            {row.original.is_active ? (
              <Badge bg="" className={"badge-success light badge"}>
                Active
              </Badge>
            ) : (
              <Badge bg="" className={"badge-success light badge"}>
                Close
              </Badge>
            )}
          </>
        ),
      },
      {
        accessorFn: (row) => `${row.qty_or_lot_size}`, // Define the column based on row data
        header: "Suggested Qty",
        size: 50,
        editable: true, // This makes the column editable
        Cell: ({ renderedCellValue, row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) =>
          `${roundToNearestFiveCents((((row.LTP ?? 0) - (row.trigger_price ?? row.trigger ?? 0)) / (row.LTP ?? 0)) * 100)}`,
        header: "Change(%)",
        size: 50,
        enableEditing: false,
      },
      {
        accessorFn: (row) =>
          `${roundToNearestFiveCents((row.trigger_price ?? row.trigger ?? 0) * (row.qty_or_lot_size ?? 0))}`,
        header: "Margin Required",
        size: 50,
        enableEditing: false,
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
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => handleDeleteRow(row.original.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );
  function roundToNearestFiveCents(amount: number): number {
    return Math.round(amount * 20) / 20;
  }
  const flattenRow = (row: Equity): Record<string, any> => {
    const flattened: Record<string, any> = {};

    // Define the specific columns you want to include in the export
    const requiredFields = [
      "watchlist_name",
      "symbol",
      "trading_symbol",
      "version",
      "status",
      "trigger_price",
      "LTP",
      "exchange_segment",
      "qty_or_lot_size",
    ];

    // Loop through the fields you need
    requiredFields.forEach((key) => {
      if (key in row) {
        let value = row[key];

        // Check if the value is an unsupported type (i.e., object or array)
        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value); // Convert object to JSON string (you can adjust this)
        }

        // If it's a valid type (string, number, boolean, null, or undefined), add it to flattened object
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null ||
          value === undefined
        ) {
          flattened[key] = value;
        } else {
          flattened[key] = ""; // Handle unsupported types if needed
        }
      }
    });

    return flattened;
  };
  // CSV Export function
  const handleExportRows = () => {
    // Ensure table_is_superuser.getSelectedRowModel() returns the expected structure
    const rows = table_is_superuser.getSelectedRowModel()?.rows || [];
    const combinedRows: any[] = [];

    rows.forEach((row) => {
      const flattenedRow = flattenRow(row.original);

      // Ensure the row is not empty or null before adding it
      if (flattenedRow) {
        combinedRows.push(flattenedRow);
      }
    });

    // Generate and download CSV with all the row data
    const generateAndDownloadCSV = (data: any[], fileName: string) => {
      // Ensure mkConfig, generateCsv, and download are defined and imported correctly
      const csvConfig = mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true, // This will use the field names as headers
        filename: fileName,
      });

      // Assuming generateCsv and download functions are defined elsewhere
      const csv = generateCsv(csvConfig)(data);
      download(csvConfig)(csv); // Pass the filename explicitly
    };

    // Export the combined rows as a single CSV file if there is data
    if (combinedRows.length > 0) {
      generateAndDownloadCSV(combinedRows, "all_orders_data");
    } else {
      console.warn("No rows selected for export");
    }
  };
  const handleMultiDeleteRow = async () => {
    const rows = table_is_superuser.getSelectedRowModel()?.rows || [];
    const rowIdsToDelete = rows.map((row) => row.original.id);
    handleDeleteRow(rowIdsToDelete);
  };
  const handleDeleteRow = async (rowId: string | string[]) => {
    try {
      const requestPayload = {
        watchlist_ids: Array.isArray(rowId) ? rowId : [rowId],
      };
      const response = await axios.delete(
        "https://api.quantradeai.com/main/watchlist/",
        {
          data: requestPayload,
          headers: headers,
        }
      );
      if (response.status === 204) {
        swal("Updated!", "Symbol Deleted Successfully!", "success");
        console.log("Symbol deleted successfully!");
        window.location.reload();
      }
    } catch (error) {
      swal("Error!", "Error deleting Symbol!", "error");
      console.error("Error deleting Symbol:", error);
    }
  };
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
        price: row.original.LTP,
        qty: row.original.qty_or_lot_size,
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
        price: row.original.LTP,
        qty: row.original.qty_or_lot_size,
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
    enableEditing: true,
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
          onClick={handleExportRows}
          variant="outlined"
        >
          <FileDownloadIcon /> &nbsp; Export
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={handleMultiDeleteRow}
          variant="outlined"
        >
          <DeleteIcon /> &nbsp; Delete WatchList
        </Button>
        <Box
          sx={{
            display: "flex",
            gap: "16px",
            padding: "8px",
            flexWrap: "wrap",
          }}
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
      </Box>
    ),
    state: {
      isLoading: data && data.length > 0 ? false : true, // Set loading state for MaterialReactTable
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
interface WatchListItem {
  watchlist_name: string;
  watchlist_number: number;
  items: any[]; // Replace `any` with the appropriate type for `items`
}
// Main application component
const App = () => {
  const [loading, setLoading] = useState(true); // State to track loading status
  const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [watchlistName, setWatchlistName] = useState("");
  const [watchlistNumber, setWatchlistNumber] = useState("");
  const [value, setValue] = React.useState("1");
  // Example token
  const tokenString: string | null = localStorage.getItem("userDetails");
  let token: { access: string; user?: any } | null = null; // Correctly define the type of token
  // Parse the token from localStorage, with error handling
  if (tokenString) {
    try {
      token = JSON.parse(tokenString);
    } catch (e) {
      console.error("Error parsing token:", e);
      token = null; // If parsing fails, set token to null
    }
  }
  // Safely access the number of allowed watchlists, defaulting to null if not available
  const watchList_Allowed =
    token?.user?.blaze_product_permissions?.num_of_allowed_watchlist ?? null;
  // Retrieve the access token safely
  const accessToken = token?.access ?? "";
  // Prepare the headers with the access token
  const headers = {
    Authorization: "Bearer " + accessToken,
  };
  useEffect(() => {
    if (!hasFetchedRef.current) {
      setLoading(true);
      hasFetchedRef.current = true;
      const fetchAllWatchlist = async () => {
        try {
          const response = await axios.get(
            "https://api.quantradeai.com/main/watchlist/",
            { headers }
          );
          if (response.data && response.data.length === 0) {
            // If no watchlist, notify the user and offer to create one
            swal(
              "Error!",
              "You have no watchlist. Would you like to create one?!",
              "error"
            );
            setIsDialogOpen(true);
          } else {
            // Assuming the response structure contains `data`
            setWatchList(response.data.data);
          }
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
      fetchAllWatchlist();
      // Cleanup function to cancel request if the component unmounts
      return () => {
        console.log("Performing cleanup operations...");
      };
    }
  }, []); // Empty dependency array means this effect runs once (componentDidMount)

  const createWatchlist = async () => {
    const isNameTaken = watchList.some(
      (item) => item.watchlist_name === watchlistName
    );
    const isNumberTaken = watchList.some(
      (item) => item.watchlist_number.toString() === watchlistNumber
    );

    if (isNameTaken) {
      swal(
        "Error!",
        "Watchlist name is already taken. Please choose a unique name.",
        "error"
      );
      return;
    }

    if (isNumberTaken) {
      swal(
        "Error!",
        "Watchlist number is already taken. Please choose a unique number.",
        "error"
      );
      return;
    }
    const watchlistData = {
      watchlist_number: watchlistNumber,
      watchlist_name: watchlistName,
    };

    try {
      const response = await axios.post(
        "https://api.quantradeai.com/main/watchlist/",
        watchlistData,
        { headers }
      );
      if (response.status === 201) {
        swal("Created!", "Watchlist created successfully!", "success");
        setIsDialogOpen(true); // Close the dialog
      } else {
        throw new Error("Failed to create watchlist");
      }
    } catch (error) {
      console.error("Error creating watchlist:", error);
      alert("Failed to create watchlist");
    }
    setIsDialogOpen(false);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      {loading ? (
        <p>Loading...</p> // Show loading text while data is being fetched
      ) : (
        <>
          <Box mb={2} sx={{ backgroundColor: "white" }}>
            {/* Button outside TabContext */}

            <Box sx={{ width: "100%", typography: "body1" }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginBottom: "20px", float: "right" }}
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Create Watchlist
                  </Button>
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                  >
                    {watchList.map((list: any, index: number) => {
                      return (
                        <Tab
                          label={list.watchlist_name}
                          value={String(index + 1)}
                          key={index}
                        />
                      );
                    })}
                  </TabList>
                </Box>
                {watchList.map((list: any, index: number) => {
                  const tabData = list.items;
                  return (
                    tabData.length > 0 && (
                      <TabPanel value={String(index + 1)} key={index}>
                        <Equity data={tabData} loading={loading} />
                      </TabPanel>
                    )
                  );
                })}
              </TabContext>
            </Box>
          </Box>
        </>
      )}

      {/* Dialog for creating watchlist */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create Watchlist</DialogTitle>
        <DialogContent>
          <div>
            <TextField
              label="Watchlist Name"
              value={watchlistName}
              onChange={(e) => setWatchlistName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>
          <div>
            <TextField
              label="Watchlist Number"
              type="number"
              value={watchlistNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (value > "0" && value <= watchList_Allowed) {
                  // Corrected the condition
                  setWatchlistNumber(value);
                }
              }}
              fullWidth
              margin="normal"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={createWatchlist} color="primary">
            Create Watchlist
          </Button>
          <Button onClick={() => setIsDialogOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
const queryClient = new QueryClient();

const Watchlist = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};
export default Watchlist;
