import React, { useContext, useEffect } from 'react';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_Row, MRT_TableOptions, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Table,TableHead, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip, Typography, DialogActions, SelectChangeEvent } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import  {AdapterDayjs}  from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import Switch from '@mui/material/Switch';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { green, red } from '@mui/material/colors';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAsIcon from '@mui/icons-material/SaveAs';

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { download, generateCsv, mkConfig } from 'export-to-csv';

const label = { inputProps: { 'aria-label': 'Switch demo' } };

export type Fut_Orders = {
    id: string;
    instrument_token: number;
    name: string;
    expiry: string;
    LTP: number;
    lot_size: string;
    current_status: string;
    last_update: string;
    high: number;
    low: number;
    strategies_with_orders: Record<string, {
      strategy_name: string;
      strategy_display_name: string;
      id: string;
      name: string;
      exchange: string;
      symbol: string;
      direction: string;
      expiry: string;
      reentry: number;
      LTP: number;
      buy_sell: string;
      instrument_token: number;
      lot_size: string;
      entry: number;
      stop_loss: number;
      target_1: number | null;
      target_2: number | null;
      target_3: number | null;
      target_4: number | null;
      target_5: number | null;
      is_triggered: boolean;
      is_missed: boolean;
      is_entry_on: boolean;
      missed_at: string | null;
      triggered_at: string;
      entry_at: string | null;
      created_at: string;
      modified_at: string;
      orders: {
        id: string;
        symbol: string;
        name: string;
        exchange: string;
        direction: string;
        expiry: string;
        reentry: number;
        LTP: number;
        current_status_id: string;
        analysis_order_id: string;
        buy_sell: string;
        strike_price: string;
        option_side: string;
        trigger: number;
        lot_size: number;
        order_type: string;
        status: string;
        is_triggered: boolean;
        is_missed: boolean;
        is_entry_on: boolean;
        strategy_name: string;
        strategy_fk_id: string;
        strategy_side: string;
        triggered_at: string | null;
        created_at: string;
        modified_at: string;
      }[];
    }>;
  };

interface WebSocketData {
  ticks: Array<{
    instrument_token: number;
    name: string;
    last_price: number;
    volume_traded: number,
    ohlc: {
      close: any;
      open: number;
      high: any,
      low: any,
    };
  }>;
}
type Strategy = Fut_Orders['strategies_with_orders'][string];
let ws: WebSocket | null = null;

const OrderDetailPanel = ({ order }) => {
    const [data, setdata] = useState(order);
    const [isEdit, setIsEdit] = useState(false);
  
    const handleInputChange = (field, value) => {
      setdata((prevData: any) => ({
        ...prevData,
        [field]: value,
      }));
    };
  
    const onEditClick = () => {
      setIsEdit((prevIsEdit) => !prevIsEdit);
    };
    const columns = useMemo(() => [
        {
            accessorFn: (row) => row.id,
            header: 'ID',
            size: 80,
            enableEditing: false,
            enableHiding: false,
        },
        {
            accessorFn: (row) => row.name,
            header: 'Name',
            size: 100,
            Cell: ({ renderedCellValue }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{renderedCellValue}</span>
                </Box>
            ),
        },
        {
            accessorFn: (row) => row.exchange,
            header: 'Exchange',
            size: 100,
            Cell: ({ renderedCellValue }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{renderedCellValue}</span>
                </Box>
            ),
        },
        {
            accessorFn: (row) => row.symbol,
            header: 'Symbol',
            size: 100,
            Cell: ({ renderedCellValue }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{renderedCellValue}</span>
                </Box>
            ),
        },
        {
            accessorFn: (row) => row.direction,
            header: 'Direction',
            size: 100,
            Cell: ({ renderedCellValue }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{renderedCellValue}</span>
                </Box>
            ),
        },
        {
            accessorFn: (row) => row.expiry,
            header: 'Expiry',
            size: 100,
            Cell: ({ renderedCellValue }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{renderedCellValue}</span>
                </Box>
            ),
        },
        {
            accessorFn: (row) => row.reentry,
            header: 'Reentry',
            size: 80,
        },
        {
            accessorFn: (row) => row.LTP,
            header: 'LTP',
            size: 80,
        },
        {
            accessorFn: (row) => row.buy_sell,
            header: 'Buy/Sell',
            size: 80,
        },
        {
            accessorFn: (row) => row.instrument_token,
            header: 'Instrument Token',
            size: 120,
        },
        {
            accessorFn: (row) => row.missed_at ? dayjs(row.missed_at).format('MM-DD-YYYY') : '-',
            header: 'Missed At',
            size: 100,
        },
        {
            accessorFn: (row) => row.triggered_at ? dayjs(row.triggered_at).format('MM-DD-YYYY') : '-',
            header: 'Triggered At',
            size: 100,
        },
        {
            accessorFn: (row) => row.entry_at ? dayjs(row.entry_at).format('MM-DD-YYYY') : '-',
            header: 'Entry At',
            size: 100,
        },
        {
            accessorFn: (row) => row.created_at ? dayjs(row.created_at).format('MM-DD-YYYY') : '-',
            header: 'Created At',
            size: 100,
        },
        {
            accessorFn: (row) => row.modified_at ? dayjs(row.modified_at).format('MM-DD-YYYY') : '-',
            header: 'Modified At',
            size: 100,
        },
      ], []);
    const table = useMaterialReactTable({
        columns,
      data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      enableColumnFilterModes: true,
      createDisplayMode: 'row', // ('modal', and 'custom' are also available)
      editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
      getRowId: (row) => row.id,
      enableRowSelection: true,
      enableEditing: true,
      muiToolbarAlertBannerProps: false
  ? {
      color: 'error',
      children: 'Error loading data',
    }
  : undefined,
muiTableContainerProps: {
  sx: {
    minHeight: '500px', // Ensure a minimum height for the table container
    maxHeight: '200px', // Max height for vertical scrolling
    overflowY: 'auto',  // Enable vertical scrolling
    overflowX: 'auto',  // Enable horizontal scrolling
    width: '100%',      // Ensure the container takes up the full available width
  },
},

      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      initialState: {
       //  showColumnFilters: true,
        showGlobalFilter: true,
        columnPinning: {
          left: ['mrt-row-expand', 'mrt-row-select'],
          right: ['mrt-row-actions'],
        },
        columnVisibility:{
          Instrumenttoken :false
        }
      },
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10,50, 100,150],
        shape: 'rounded',
        variant: 'outlined',
      },
      });
    
      if (data.length === 0) {
        return <div>Loading data...</div>; // Fallback if no data is available
      }
    
      return (
        <MaterialReactTable table={table} />
      );
};

const UserDetailPanel = ({ Data }: { Data: Fut_Orders }) => {
    const [data, setData] = useState<Strategy[]>([]);
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
    const [selectedStrategy, setSelectedStrategy] = useState<string>('');
    // Effect to update data when `Data` changes
    useEffect(() => {
      // Log the incoming Data to check structure
      console.log('Data received:', Data);
  
      const strategies = Data?.strategies_with_orders;
      if (strategies && Object.keys(strategies).length > 0) {
        const strategyNames = Object.keys(strategies);
        const firstStrategy = strategyNames[0];
        setSelectedStrategy(firstStrategy);
  
        const filteredStrategies = strategies[firstStrategy];
        setData(Array.isArray(filteredStrategies) ? filteredStrategies : [filteredStrategies]);
      }
    }, [Data]);
    const handleStrategyChange = (event: SelectChangeEvent<string>) => {
        const selected = event.target.value;
        setSelectedStrategy(selected);
        const strategies = Data?.strategies_with_orders;
        if (strategies && selected) {
          const filteredStrategies = strategies[selected];
          setData(Array.isArray(filteredStrategies) ? filteredStrategies : [filteredStrategies]);
        }
      };
    // Memoized columns configuration
    const columns = useMemo(() => [
        {
          accessorFn: (row) => row.strategy_name,
          header: 'Strategy Name',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.strategy_display_name,
          header: 'Strategy Display Name',
          size: 150,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.id,
          header: 'ID',
          size: 80,
          enableEditing: false,
          enableHiding: false,
        },
        {
          accessorFn: (row) => row.name,
          header: 'Name',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.exchange,
          header: 'Exchange',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.symbol,
          header: 'Symbol',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.direction,
          header: 'Direction',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.expiry,
          header: 'Expiry',
          size: 100,
          Cell: ({ renderedCellValue }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => row.reentry,
          header: 'Reentry',
          size: 80,
        },
        {
          accessorFn: (row) => row.LTP,
          header: 'LTP',
          size: 80,
        },
        {
          accessorFn: (row) => row.buy_sell,
          header: 'Buy/Sell',
          size: 80,
        },
        {
          accessorFn: (row) => row.instrument_token,
          header: 'Instrument Token',
          size: 120,
        },
        {
          accessorFn: (row) => row.lot_size,
          header: 'Lot Size',
          size: 80,
        },
        {
          accessorFn: (row) => row.entry,
          header: 'Entry',
          size: 100,
        },
        {
          accessorFn: (row) => row.stop_loss,
          header: 'Stop Loss',
          size: 100,
        },
        {
          accessorFn: (row) => row.target_1,
          header: 'Target 1',
          size: 100,
        },
        {
          accessorFn: (row) => row.target_2,
          header: 'Target 2',
          size: 100,
        },
        {
          accessorFn: (row) => row.target_3,
          header: 'Target 3',
          size: 100,
        },
        {
          accessorFn: (row) => row.target_4,
          header: 'Target 4',
          size: 100,
        },
        {
          accessorFn: (row) => row.target_5,
          header: 'Target 5',
          size: 100,
        },
        {
          accessorFn: (row) => row.is_triggered ? 'Yes' : 'No',
          header: 'Triggered',
          size: 80,
        },
        {
          accessorFn: (row) => row.is_missed ? 'Yes' : 'No',
          header: 'Missed',
          size: 80,
        },
        {
          accessorFn: (row) => row.is_entry_on ? 'Yes' : 'No',
          header: 'Entry On',
          size: 80,
        },
        {
          accessorFn: (row) => row.missed_at ? dayjs(row.missed_at).format('MM-DD-YYYY') : '-',
          header: 'Missed At',
          size: 100,
        },
        {
          accessorFn: (row) => row.triggered_at ? dayjs(row.triggered_at).format('MM-DD-YYYY') : '-',
          header: 'Triggered At',
          size: 100,
        },
        {
          accessorFn: (row) => row.entry_at ? dayjs(row.entry_at).format('MM-DD-YYYY') : '-',
          header: 'Entry At',
          size: 100,
        },
        {
          accessorFn: (row) => row.created_at ? dayjs(row.created_at).format('MM-DD-YYYY') : '-',
          header: 'Created At',
          size: 100,
        },
        {
          accessorFn: (row) => row.modified_at ? dayjs(row.modified_at).format('MM-DD-YYYY') : '-',
          header: 'Modified At',
          size: 100,
        },
      ], []);
  
    // Material React Table configuration
    const table = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableColumnFilterModes: true,
        createDisplayMode: 'row', // ('modal', and 'custom' are also available)
        editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
        getRowId: (row) => row.id,
        enableRowSelection: true,
        enableEditing: true,
        muiToolbarAlertBannerProps: false
    ? {
        color: 'error',
        children: 'Error loading data',
      }
    : undefined,
  muiTableContainerProps: {
    sx: {
      minHeight: '500px', // Ensure a minimum height for the table container
      maxHeight: '400px', // Max height for vertical scrolling
      overflowY: 'auto',  // Enable vertical scrolling
      overflowX: 'auto',  // Enable horizontal scrolling
      width: '100%',      // Ensure the container takes up the full available width
    },
  },
  
        enableColumnOrdering: true,
        enableGrouping: true,
        enableColumnPinning: true,
        enableFacetedValues: true,
        initialState: {
         //  showColumnFilters: true,
          showGlobalFilter: true,
          columnPinning: {
            left: ['mrt-row-expand', 'mrt-row-select'],
            right: ['mrt-row-actions'],
          },
          columnVisibility:{
            Instrumenttoken :false
          }
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        muiSearchTextFieldProps: {
          size: 'small',
          variant: 'outlined',
        },
        muiPaginationProps: {
          color: 'secondary',
          rowsPerPageOptions: [10,50, 100,150],
          shape: 'rounded',
          variant: 'outlined',
        },
      renderDetailPanel: ({ row }) => {
        return <OrderDetailPanel order={row.original.orders} />;
      },
      state: {
        isLoading: data && data.length === 0,
        columnVisibility
      },
    });
  
    if (data.length === 0) {
      return <div>Loading data...</div>; // Fallback if no data is available
    }
    const strategyNames = Data?.strategies_with_orders ? Object.keys(Data.strategies_with_orders) : [];

    return (
      <>
        <FormControl sx={{ minWidth: 200, marginBottom: '1rem' }}>
          <InputLabel id="strategy-select-label">Select Strategy</InputLabel>
          <Select
          labelId="strategy-select-label"
          value={selectedStrategy}
          label="Select Strategy"
          onChange={handleStrategyChange}
        >
          {strategyNames.map((strategyName) => (
            <MenuItem key={strategyName} value={strategyName}>
              {strategyName}
            </MenuItem>
          ))}
        </Select>
        </FormControl>
  
        <MaterialReactTable table={table} />
      </>
    );
  };
   const InActive_Users = (_data) => {
    const Data = useMemo(() => _data.data, [_data])
    const [data, setData] = useState<Fut_Orders[]>([]);
    const watchList = _data.Watchlist;
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
     const [open, setOpen] = useState(false);
     const [customerID, setCustomerID] = useState("");
      const [gtdDate, setGtdDate] = useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValuesWL, setSelectedValuesWL] = useState<string[]>([]);
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+accessToken,
    };


    const handleEditRow = (row,table) => {
      setEditingRowId(row.id);
      setEditedRow(row.original);
      table.setEditingRow(row);
      
    };
    const handleCancelEdit = () => {
      setEditingRowId(null);
      setEditedRow({});
    };
  
    const handleUpdateRow = () => {
      // setTableData((prevData) =>
      //   prevData.map((row) =>
      //     row.id === editingRowId ? { ...row, ...editedRow } : row
      //   )
      // );
      setEditingRowId(null);
      setEditedRow({});
    };


    const handleSaveUser: MRT_TableOptions<Fut_Orders>['onEditingRowSave'] = async ({
      values,
      table,
    }) => {
      // const newValidationErrors = validateUser(values);
      // if (Object.values(newValidationErrors).some((error) => error)) {
      //   setValidationErrors(newValidationErrors);
      //   return;
      // }
      setValidationErrors({});
     // await updateUser(values);
      table.setEditingRow(null); //exit editing mode
    };

    const handleDelete = async (row) => {
        const ids = row.original.id;
        try {
            const response = await axios.delete(`https://api.quantradeai.com/user/futOrders_delete`, {  data: { strategy_ids: ids },headers});
          if (response.status === 200) {
            await swal("Deleted!", "Order Deleted successfully!", "success");
          } else {
            await swal("Failed!", "Failed to delete orders!", "error");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          await swal("Failed!", "Failed to delete orders!", "error");
        }
      };
      const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };
      const handleConfirm = () => {
          if (customerID > "0" && gtdDate) {
            const rows = table_is_superuser.getSelectedRowModel().rows;
            handleExportRows(rows, customerID, gtdDate);
            setOpen(false); // Close modal after export
          } else {
            alert("Please fill in both Customer ID and GTD Date.");
          }
        };
       const flattenRow = (row: Fut_Orders): Record<string, any> => {
           const flattened: Record<string, any> = {};
         
           Object.keys(row).forEach((key) => {
             if (key !== 'id' && key !== 'instrument_token') {
               const value = row[key];
               if (typeof value === 'object' && value !== null) {
                 // If it's an object or array, convert it to a string using JSON.stringify
                 flattened[key] = value;
               } else {
                 flattened[key] = value;
               }
             }
           });
         
           return flattened;
         };
         
         function roundToNearestFiveCents(amount: number): number {
           return Math.round(amount * 20) / 20;
         }
         
         function addPercentAmount(amount: number): string {
           amount = parseFloat(amount.toString());
           const fivePercent = amount * 0.02;
           const total = amount + fivePercent;
           return roundToNearestFiveCents(total).toFixed(2); // Round to nearest 0.05
         }
         
         function addPercentAmountSell(amount: number): string {
           amount = parseFloat(amount.toString());
           const fivePercent = amount * 0.02;
           const total = amount - fivePercent;
           return roundToNearestFiveCents(total).toFixed(2); // Round to nearest 0.05
         }
         
         const handleExportRows = (rows: MRT_Row<Fut_Orders>[], customerID: string, gtdDate: string) => {
           const formatGTDDate = (dateStr: string): string => {
             const date = new Date(dateStr);
             const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
             const day = String(date.getDate()).padStart(2, '0');
             const year = date.getFullYear();
             return `${month}/${day}/${year}`;
           };
         
           const formattedGTDDate = formatGTDDate(gtdDate);
         
           // Helper function to handle the order creation
           const generateOrderData = (orders: any[]) => {
             return orders.map((order) => {
               if (!order || !order.instruments) {
                 return null;
               }
         
               return {
                 Exchange: "NSE",
                 ScripCode: order.instruments.exchange_token || "",
                 ScripName: order.instruments.trading_symbol || "",
                 OrderPrice: order.order_type === "entry"? addPercentAmount(order.trigger):order.order_type.includes("target_")? "" : addPercentAmountSell(order.trigger),
                 TriggerPrice: order.order_type === "entry"||order.order_type.includes("target_")? parseFloat(order.trigger).toFixed(2) : parseFloat(order.trigger),
                 OrderQty: order.quantity || 0,
                 DisclosedQty: 0,
                 BuySell: order.order_type === "entry" ? "BUY" : "SELL",
                 OrderType: "NEW",
                 RMS: "",
                 PriceType: "LIMIT",
                 CustomerID: customerID,
                 S2KID: customerID,
                 OrderID: 0,
                 ExecQty: 0,
                 ExecPrice: 0,
                 OrderValidity: "MyGTD",
                 GTDDate: formattedGTDDate,
               };
             }).filter((item) => item !== null);
           };
         
           // Split rows based on order type
           const entryRows: any[] = [];
           const targetRows: any[] = [];
           const slRows: any[] = [];
         
           rows.forEach((row) => {
             const flattenedRow = flattenRow(row.original);
         
             if (flattenedRow) {
              // const entries = flattenedRow.orders?.order_type === 'entry' ? [flattenedRow.orders] : [];
              // const stoplosses = flattenedRow.orders?.order_type === 'stop_loss' ? [flattenedRow.orders] : [];
              // const targets = flattenedRow.orders?.order_type?.includes("target_") ? [flattenedRow.orders] : [];
              // const combinedOrders = [...entries, ...stoplosses, ...targets];
         
              flattenedRow.orders.forEach((order) => {
                 if (order) {
                   // Sort orders based on order_type
                   if (order.order_type === "entry") {
                     entryRows.push(order);
                   } else if (order.order_type?.includes("target_")) {
                     targetRows.push(order);
                   } else if (order.order_type === "stop_loss") {
                     slRows.push(order);
                   }
                 }
               });
             }
           });
         
           const entryData = generateOrderData(entryRows);
           const targetData = generateOrderData(targetRows);
           const slData = generateOrderData(slRows);
         
           const generateAndDownloadCSV = (data: any[], fileName: string) => {
             const csvConfig = mkConfig({
               fieldSeparator: ',',
               decimalSeparator: '.',
               useKeysAsHeaders: true,
               filename:fileName,
             });
             const csv = generateCsv(csvConfig)(data);
             download(csvConfig)(csv); // Pass the filename explicitly
           };
           if (entryData.length > 0) {
             generateAndDownloadCSV(entryData, 'entry_orders');
           }
           if (targetData.length > 0) {
             generateAndDownloadCSV(targetData, 'target_orders');
           }
           if (slData.length > 0) {
             generateAndDownloadCSV(slData, 'stoploss_orders');
           }
         };
         const handleCloseModal=()=> {
          setIsOpen(false);
        }
        const handleOpenModal=()=> {
          setIsOpen(true);
        }
        const handleChange = (e: any) => {
          const wl = Array.isArray(watchList) ? watchList : [];  // Ensure watchList is an array
          setSelectedValuesWL(e.target.value);
        };
        const handleSubmit = () => {
          const selectedRows = table_is_superuser.getSelectedRowModel().rows.map((row) => row.original);
          const items = selectedRows.map((row) => {
            // Fix: Make sure entries is properly checked if it exists
            return {
            //   symbol: row.symbol,  // Assuming 'symbol' is the correct key from your row
            //   trading_symbol: row.symbol || "", // Assuming 'trading_symbol' exists
            //   version: row.version || "", // Assuming 'version' exists
            //   status: row.status || "", // Assuming 'status' exists
            //   trigger_price: row.orders? +row.orders[0].trigger : 0, // Safe check for 'entries'
            //   LTP: row.LTP || 0, // Assuming 'LTP' exists
            //   qty_or_lot_size: row.orders? +row.orders[0].lot_size : 0 // Safe check for 'entries'
            };
          });
      
          const watchlist_request = {
            watchlist_number: selectedValuesWL, // Assuming this is selected from somewhere
            watchlist_name: watchList.filter((x: any) => x.watchlist_number == selectedValuesWL)[0].watchlist_name, // Fetches watchlist name based on the selected number
            items: items
          };
      
          axios.post("https://api.quantradeai.com/main/watchlist/", watchlist_request, {
            headers: headers
          })
            .then((response) => {
              console.log("Response from API: ", response.data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
           
              handleCloseModal();
            
        };
        const fetchIndexData = async () => {
          try {
    
            ws = new WebSocket('ws://localhost:7789');
    
            ws.onopen = () => {
              console.log('Connected to WebSocket server');
            };
          
            ws.onmessage = (event) => {
              const dataWS: WebSocketData = JSON.parse(event.data);
              if (dataWS && dataWS.ticks && dataWS.ticks.length > 0) {
                console.log('Received ticks index:', dataWS.ticks);
            
                // Create a map of instrument tokens to ticks for faster lookup
                const tickMap = new Map(dataWS.ticks.map((tick: any) => [String(tick.instrument_token), tick]));
                setData((prevData) => {
                  const updatedData = prevData.map((row) => {
                    const tick = tickMap.get(String(row.instrument_token));
                    if (tick) {
                      return { ...row, LTP: tick.last_price,high: tick.ohlc.high,low:tick.ohlc.low };  // Update LTP field
                    }
                    return row;
                  });
                  return updatedData;
                });
              }
            }
           
            ws.onclose = () => {
             // console.log('Disconnected from WebSocket server');
            };
    
            ws.onerror = (error) => {
              console.log('WebSocket error:', error);
            };
          } catch (error) {
            console.log(error);
          }
      };
      useEffect(() => {
        fetchIndexData();
      },[]);
        useEffect(() => {
          const fetchData = async () => {
            if (Data && Data.length > 0) {
              setData(Data);
              let tokens = [...new Set(Data.map(x => x.instrument_token))];
              console.log("tokens", tokens);
              
              const userDetails = localStorage.getItem("userDetails") 
                ? JSON.parse(localStorage.getItem("userDetails") || "") 
                : {};
                const { access_token, api_key } = userDetails?.user?.kite || {};
              // Check if user details and tokens are available before making the API call
              if (tokens.length > 0 && access_token && api_key) {
                // Make the API request
                try {
                  const response = await axios.get('http://localhost:3004/api/getLiveData', {
                    params: {
                      api_key,
                      access_token,
                      tokens: tokens,// Ensure tokens are passed as a comma-separated string
                    }
                  });
        
                  console.log('API Response:', response.data);
                  // Handle the response here
                } catch (error) {
                  console.error('Error fetching live spread:', error);
                  // Handle the error here
                }
              } else {
                console.error('Missing user details or tokens');
              }
            }
          };
        
          // Call the async function
          fetchData();
        }, [Data]);
        const columns = useMemo<MRT_ColumnDef<Fut_Orders>[]>(() => [
          {
            accessorKey: 'id',
            header: 'Id',
            enableEditing: false,
            size: 80,
            enableHiding: false,
          },
          {
            accessorFn: (row) => `${row.instrument_token}`,
            id:'Instrumenttoken',
            header: 'Instrument token',
            enableEditing: false,
            size: 80,
            enableHiding: false,
          },
          {
            accessorFn: (row) => `${row.name}`,
            id: 'name',
            header: 'Name',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
              accessorFn: (row) => `${row.LTP}`,
              enableClickToCopy: true,
              header: 'LTP',
              size: 100,
              Cell: ({ renderedCellValue, row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>{renderedCellValue}</span>
                </Box>
              ),
            },
          {
            accessorFn: (row) => `${row.expiry}`,
            header: 'Expiry Date',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.expiry
                  ? dayjs(row.original.expiry).format('MM-DD-YYYY')
                  : dayjs(new Date()).format('MM-DD-YYYY')}
              </>
            ),
          },
          {
            accessorFn: (row) => `${row.lot_size}`,
            header: 'Lot Size',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.lot_size}
              </>
            ),
          },
          {
            accessorFn: (row) => `${row.high}`,
            enableClickToCopy: true,
            header: 'High',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.low}`,
            enableClickToCopy: true,
            header: 'Low',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.last_update}`, // Safely access orders[0] and triggered_at
            header: 'Triggered Date',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.last_update
                  ? dayjs(row.original.last_update).format('MM-DD-YYYY')
                  : dayjs(new Date()).format('MM-DD-YYYY')}
              </>
            ),
          },
        ], []);
        
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      enableColumnFilterModes: true,
      createDisplayMode: 'row', // ('modal', and 'custom' are also available)
      editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
      getRowId: (row) => row.id,
      enableRowSelection: true,
      enableEditing: true,
      muiToolbarAlertBannerProps: false
  ? {
      color: 'error',
      children: 'Error loading data',
    }
  : undefined,
muiTableContainerProps: {
  sx: {
    minHeight: '500px', // Ensure a minimum height for the table container
    maxHeight: '400px', // Max height for vertical scrolling
    overflowY: 'auto',  // Enable vertical scrolling
    overflowX: 'auto',  // Enable horizontal scrolling
    width: '100%',      // Ensure the container takes up the full available width
  },
},

      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      initialState: {
       //  showColumnFilters: true,
        showGlobalFilter: true,
        columnPinning: {
          left: ['mrt-row-expand', 'mrt-row-select'],
          right: ['mrt-row-actions'],
        },
        columnVisibility:{
          Instrumenttoken :false
        }
      },
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10,50, 100,150],
        shape: 'rounded',
        variant: 'outlined',
      },
      onEditingRowSave: handleSaveUser,
      renderRowActions: ({ row, table }) => (
        <Box sx={{ display: 'flex' }}>
        <Tooltip title="Edit" style={{opacity:1}}>
          <IconButton style={{padding: '0.30rem 0.3rem'}} onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" style={{opacity:1}}>
          <IconButton color="error" onClick={() => handleDelete(row)} style={{padding: '0.30rem 0.3rem'}}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      ),
      renderDetailPanel: ({ row }) => {
        return <UserDetailPanel Data={row.original} />;
      },
       renderTopToolbarCustomActions: ({ table }) => (
         <Box sx={{display: 'flex',gap: '16px',padding: '8px',flexWrap: 'wrap'}} >
           <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined" onClick={handleOpenModal}  ><AddIcon />&nbsp; Add to Watchlist </Button>
           <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={handleClickOpen}
           variant="outlined"><FileDownloadIcon /> &nbsp; Export</Button>
         </Box>
       ),
       state: {
        isLoading: data && data.length >= 0 ? false : true, // Set loading state for MaterialReactTable
         columnVisibility
     },
    });
    return (
      <>
    <MaterialReactTable table={table_is_superuser} />
    <Dialog open={open} onClose={handleClose}>
  <DialogTitle>Enter CustomerID and GTD Date</DialogTitle>
  <DialogContent>
    <TextField
      label="Customer ID"
      type="text"
      value={customerID}
      onChange={(e) => setCustomerID(e.target.value)}
      fullWidth
      required
      InputProps={{
        inputMode: 'numeric', // Helps on mobile devices for numeric input
      }}
      helperText={customerID || customerID <= "0" ? "Please enter a valid Customer ID" : ""}
    />
    <TextField
      label="GTD Date"
      type="date"
      value={gtdDate}
      onChange={(e) => setGtdDate(e.target.value)}
      fullWidth
      required
      error={!gtdDate}
      helperText={!gtdDate ? "Please enter a valid GTD Date" : ""}
      InputLabelProps={{
        shrink: true, // Ensure the label is always visible
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose} color="secondary">Cancel</Button>
    <Button
      onClick={handleConfirm}
      color="primary"
      disabled={customerID <= "0" || !gtdDate} // Disable Export button if invalid inputs
    >
      Export
    </Button>
  </DialogActions>
</Dialog>
      <Dialog
        open={isOpen}
        onClose={handleCloseModal}
        PaperProps={{
          component: "form",
          style: {
            width: '500px',
            maxWidth: '100%',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" gutterBottom>
            Add to Watchlist
            <CancelIcon onClick={handleCloseModal} style={{ margin: "0px 0px 0px 250px", cursor: "pointer" }} />
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box p={3} maxWidth={700} mx="auto" display="flex" flexDirection="column" gap={3}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Select Watch List</InputLabel>
                <Select
                  labelId="demo-multiple-name-label"
                  label="Select Watch List"
                  value={selectedValuesWL}
                  onChange={handleChange}
                >
                  {(Array.isArray(watchList) ? watchList : []).map((name: any) => (  // Check if watchList is an array
          <MenuItem key={name.watchlist_number} value={name.watchlist_number}>
            {name.watchlist_name}
          </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit} color="success">Add</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
            </>
    )
  };
  // Main application component
  const App = ({ Value }) => {
    const [selectedValue, setSelectedValue] = useState(Value);
    const [equity_orders, setEquity_Orders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [watchList, setWatchList] = useState([]);
    const token = localStorage.getItem("userDetails") || '';
    const accessToken = token ? JSON.parse(token).access : "";
  
    const headers = {
      Authorization: "Bearer " + accessToken,
    };
  
    useEffect(() => {
      // Whenever `Value` prop changes, reset the selected value and refetch data
      setSelectedValue(Value);
      setLoading(true); // Reset loading state when `Value` changes
  
      const fetchStrategy_Details = async () => {
        const requestPayload = {};
      
        try {
          const value = selectedValue.split(",");
          for (let key of value) {
            if (key) {
              requestPayload[key] = true;
            }
          }
      
          const response = await axios.post(
            `https://api.quantradeai.com/strategy/fno/analysis/orders/v2/?paginate=false&clear_cache=true`,
            requestPayload,  // Send just the payload object directly
            {
                headers: headers // Ensure headers are set
            }
        );
      
          if (response.status === 200) {
            setEquity_Orders(response.data.data);
          }
        } catch (error) {
          swal('Error!', 'Error fetching data!', 'error');
          console.error('Error fetching data:', error);
        }
      };
      const fetchAllWatchlist = async () => {
        try {
          const response = await axios.get('https://api.quantradeai.com/main/watchlist', { headers });
          setWatchList(response.data.data);
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStrategy_Details();
      fetchAllWatchlist();
    }, [Value]); // The useEffect hook now triggers every time `Value` changes
  
    return (
      <>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Box mb={2}>
            <InActive_Users data={equity_orders} Watchlist={watchList} loading={loading} />
          </Box>
        )}
      </>
    );
  };
  
  const queryClient = new QueryClient();
  
  const FutureOptionsStratagy = ({ value }) => {
    const [Value, setValue] = useState(value);
    
    return (
      <QueryClientProvider client={queryClient}>
        <App Value={Value} />
      </QueryClientProvider>
    );
  };
export default FutureOptionsStratagy;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}
