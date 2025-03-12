import React, { useEffect } from 'react';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_TableOptions,MRT_Row, useMaterialReactTable, MRT_GlobalFilterTextField, MRT_ToggleFiltersButton } from 'material-react-table';
//Material UI Imports
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, lighten, Tab, TextField, Tooltip } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import axios from 'axios';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import dayjs from 'dayjs';
const label = { inputProps: { 'aria-label': 'Switch demo' } };
export type Watchlist = {
    id:string;
    created_at: string;
    order_type:string;
    symbol: string;
    entry_price:number;
    equity_orders:string;
    fno_orders:string;
    avg_price:number;
    lot_size_or_qty: number;
    buy_sell: any;
    status:string;
};

  const Equity = (_data) => {
    const data=_data.data;
    const tabValue =_data.tabValue
    const [openDialog, setOpenDialog] = useState(false); // State to open/close dialog
  const [orderDetails, setOrderDetails] = useState<any>([]); // State to store order details for modification
  const [modifiedQty, setModifiedQty] = useState('');
  const [modifiedEntryPrice, setModifiedEntryPrice] = useState('');
    // Example token
    const token = localStorage.getItem('userDetails') || '';
    const accessToken = token ? JSON.parse(token).access : '';
    const headers = {
      Authorization: 'Bearer ' + accessToken,
    };

    const [columnVisibility, setColumnVisibility] = React.useState({
      id: false, // Initially hide the "age" column
    });
    const handleMultiCancelRow = async()=>{
      const rows = table_is_superuser.getSelectedRowModel()?.rows || [];
      const rowIdsToDelete = rows.map((row) => row.original.id);
      handleCancel(rowIdsToDelete);
    }
    const handleCancel = async (rowId) => {
    
      const body = {
        ids:Array.isArray(rowId) ? rowId : [rowId], // Use the unique order ID for canceling
      };
    
      try {
        const response = await axios.post('https://api.quantradeai.com/oms/order/cancel/',body, { headers });
        console.log('Order cancelled successfully:', response.data);
        if (response.status === 200) {
          swal("Cancel!", "Order Canceled Successfully!", "success");
          window.location.reload(); 
        }
      } catch (error) {
        swal("Error!", "Error deleting Orders!", "error");
      }
    };
    const baseColumns  = useMemo<MRT_ColumnDef<Watchlist>[]>(
      () => [  
        {
          accessorFn: (row) => `${row.symbol}`, //accessorFn used to join multiple data into a single cell
          id: 'symbol', //id is still required when using accessorFn instead of accessorKey
          header: 'Symbol',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
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
          header: 'QTY',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
            accessorFn: (row) => `${row.avg_price??row.entry_price}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            enableClickToCopy: true,
            header: 'Avg Price',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
        {
            accessorFn: (row) => `${row.buy_sell}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Order Type',
            size: 100,
            Cell: ({ row }) => (
                <>
                    {row.original.buy_sell == "BUY" ? <Button variant="contained" style={{borderRadius: "17px"}} color="success"> Buy </Button>
                       : <Button variant="contained" style={{borderRadius: "17px"}} color="error"> Sell </Button>}
                </>
                ),
          },
          {
            accessorFn: (row) => `${row.status}`,
            header: 'Order Status',
            size: 100,
            Cell: ({ row }) => {
              const status = row.original.status;
          
              let statusColor;
              if (status === 'COMPLETE') {
                statusColor = 'green';
              } else if (['NEW', 'PENDING', 'MODIFIED'].includes(status)) {
                statusColor = 'yellow';
              } else if (['REJECTED', 'CANCELLED'].includes(status)) {
                statusColor = 'red';
              }
          
              return (
                <span style={{ color: statusColor }}>
                  {status}
                </span>
              );
            },
          },
        {
          accessorFn: (row) => `${row.created_at}`, 
          id: 'datetime',
          header: 'Date',
          size: 100,
          Cell: ({ row }) => (
          <>
              {row.original.created_at ? dayjs(row.original.created_at).format('MM-DD-YYYY') : ""}
          </>
          ),
        },
      ],
      [],
    );
    const actionColumn = [
      {
        accessorFn: (row) => `${row.buy_sell}`,
        header: 'Actions',
        size: 100,
        Cell: ({ row }) => (
          <>
             <Box
                         sx={{
                           display: 'flex',
                           gap: '1rem',
                         }}
                       >
                <Button
                  variant="contained"
                  style={{ borderRadius: '17px', marginRight: '8px' }}
                  color="error"
                  onClick={() => handleCancel(row.original.id)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  style={{ borderRadius: '17px' }}
                  color="primary"
                  onClick={() => handleModify(row.original)}
                >
                  Modify
                </Button>
              </Box>
          </>
        ),
      },
    ];
  
    // Conditionally add the action column for "Pending" tab
    const columns = tabValue === '2' ? [...baseColumns, ...actionColumn] : baseColumns;
    const handleModify = async (order) => {
        setOrderDetails(order);
        setModifiedQty(order.lot_size_or_qty);
        setModifiedEntryPrice(order.avg_price??order.entry_price);
        setOpenDialog(true);
    };

    const handleSubmitModify = async () => {
      const body = {
        lot_size_or_qty: modifiedQty,
        entry_price: modifiedEntryPrice
      };
  
      try {
        const response = await axios.patch(`https://api.quantradeai.com/oms/order/?id=${orderDetails.id}`, body, { headers });
        console.log('Order modified successfully:', response.data);
        setOpenDialog(false);
      } catch (error) {
        console.error('Error modifying order:', error);
      }
    };
    const handleCloseDialog = () => {
      setOpenDialog(false);
    };
    const table_is_superuser = useMaterialReactTable({
      columns,
      data,
      editDisplayMode: 'cell',
      muiTableContainerProps: { sx: { minHeight: '500px' } },
      enableColumnOrdering: true,
      enableRowSelection: tabValue === '2' ? true: false,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10, 20, 30],
        shape: 'rounded',
        variant: 'outlined',
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
        <Box sx={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap' }}>
        {tabValue === '2' && (
          <Button
            disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={handleMultiCancelRow}
            variant="outlined"
          >
            <DeleteIcon /> &nbsp; Cancel
          </Button>
        )}
      </Box>
      ),
      state: {
        isLoading: data && data.length >= 0 ? false : true , // Set loading state for MaterialReactTable
        columnVisibility
    }
    });
    return (
    <>
    <MaterialReactTable table={table_is_superuser}/>
    <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Modify Order</DialogTitle>
        <DialogContent>
          {orderDetails && (
            <>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={modifiedQty}
                onChange={(e) => setModifiedQty(e.target.value)}
                margin="normal"
              />
              <TextField
                label="Entry Price"
                type="number"
                fullWidth
                value={modifiedEntryPrice}
                onChange={(e) => setModifiedEntryPrice(e.target.value)}
                margin="normal"
              />
              {/* You can add more fields if needed, such as trigger price */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitModify} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
    )
  };
  // Main application component
  const App = () => {
    const [orders, setOrders] = useState({ all: [], completed: [], pending: [] }); // State for storing user data
    const [loading, setLoading] = useState(true); // State to track loading status
    const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
    const [value, setValue] = React.useState('1');
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";;

    const headers = {
      Authorization: "Bearer "+ accessToken,
    };


    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
  
        const fetchAllOrders = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/oms/order/',{headers});
            setOrders(response.data.data);
          } catch (error) {
            if (axios.isCancel(error)) {
              console.log('Request canceled:', error.message);
            } else {
              console.error('Error fetching data:', error);
            }
          } finally {
            setLoading(false); // End loading after the request completes
          }
        };
       
        fetchAllOrders();
        return () => {
          console.log('Performing cleanup operations...');
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
          <Box mb={2} sx={{backgroundColor: "white"}}>

          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="All" value="1" />
                    <Tab label="Pending" value="2" />
                    <Tab label="Completed" value="3" />
                </TabList>
                </Box>
                 {/* Render each tab's content */}
                 <TabPanel value="1">
                <Equity data={orders.all} tabValue="1" />
              </TabPanel>
              <TabPanel value="2">
                <Equity data={orders.pending} tabValue="2" />
              </TabPanel>
              <TabPanel value="3">
                <Equity data={orders.completed} tabValue="3" />
              </TabPanel>
                </TabContext>
            </Box>
          </Box>
            </>
         
        )}
      </>
    );
  };
  const queryClient = new QueryClient();

const OrderTab = () => {
	return(
		<QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>	
		
	)
}
export default OrderTab;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}
