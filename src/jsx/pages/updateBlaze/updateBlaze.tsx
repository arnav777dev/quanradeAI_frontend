import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { DataGrid, GridColDef, GridRowId, GridCallbackDetails, GridRowSelectionModel} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TabContext from "@mui/lab/TabContext";
import { TabList, TabPanel } from "@mui/joy";
import swal from "sweetalert";

const cors = require("cors");
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const myValue: string | null = localStorage.getItem("userData");

let KiteId: any; // You can specify a more accurate type based on your expected structure.

if (myValue !== null) {
  console.log(myValue);
  KiteId = JSON.parse(myValue);
} else {
  // Handle the case where myValue is null
  KiteId = {}; // or whatever default value makes sense for your application
}
// Example token
const token = localStorage.getItem("userDetails") || ""; // Provide a fallback to an empty string
console.log(token);
const accessToken = token ? JSON.parse(token).access : "";

const headers = {
  Authorization: "Bearer " + accessToken,
};

const columnsMissed: GridColDef[] = [
  { field: "id", headerName: "Id", width: 130 },
  { field: "symbol", headerName: "Symbol", width: 130 },
  { field: "trading_symbol", headerName: "Trading Symbol", width: 130 },
  { field: "strategy", headerName: "Strategy", width: 130 },
  { field: "expiry", headerName: "Expiry", width: 130 },
];
const columnsSL: GridColDef[] = [
  { field: "id", headerName: "Id", width: 130 },
  { field: "symbol", headerName: "Symbol", width: 130 },
  { field: "trading_symbol", headerName: "Trading Symbol", width: 130 },
  { field: "strategy", headerName: "Strategy", width: 130 },
  { field: "expiry", headerName: "Expiry", width: 130 },
];
const columnsRejected: GridColDef[] = [
  { field: "id", headerName: "Id", width: 130 },
  { field: "rejected_symbols", headerName: "Symbols", width: 130 },
  { field: "strategy", headerName: "Strategy", width: 130 },
  { field: "reason", headerName: "Reason", width: 130 },
  { field: "expiry", headerName: "Expiry", width: 130 },
];

const rows: readonly any[] | undefined = [];
interface DataType {
  rejected_symbols: any;
  strategy_fk:any;
  id?: string;
  name?: string;
  symbol?: string;
  strategy?: string;
  reason?: string;
  expiry?: string; // Optional for rejected data
}

interface SelectedValues {
  [key: string]: {
    exclude?: string[];
    symbol?: string[];
    expiry?: string;
    batchSize?: string;
    sleepTime?: string;
  };
}

const paginationModel = { page: 0, pageSize: 5 };
export default function PatchUpdate() {
  const [isModalUpdateVisible, setIsModalUpdateVisible] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [valueinner, setValueInner] = React.useState(0);
  const [nfoArrayData, setNFOArrayData] = useState<string[]>([]);
  const [strategynames, setStrategynamesData] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({});
  const [expiryDates, setExpiryDates] = useState({});
  const [expandAccordion, setExpandAccordion] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [regenrateData, setRegenrateData] = useState<any[]>([]);
  const [missedData, setMissedData] = useState<DataType[]>([]);
  const [slData, setSlData] = useState<DataType[]>([]);
  const [rejectedData, setRejectedData] = useState<DataType[]>([]);
  const [loadingState, setLoadingState] = useState({});

  const headerElement = document.getElementById("headerTextUpdate");
  if (headerElement) {
    headerElement.innerHTML = "Update Blaze";
  }
  const updateBlazePost = async (url: any, body: any) => {
    try {
      const response = await axios.post(
        `https://api.quantradeai.com/${url}`,
        body,
        { headers }
      );
      setLoading(false);
      console.log("Data patched successfully:", response.data);
      await swal("Updated!", "Updated successfully!", "success");
    } catch (error) {
      console.error("Error patching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setMissedData(regenrateData.filter((item) => item.is_missed === true));
    setSlData(regenrateData.filter((item) => item.is_sl_triggered === true));
    setRejectedData(regenrateData.filter((item) => item.is_rejected === true));
  }, [regenrateData]);

  const filterRegenrateData = (data: any[], columns: any[]): any[] => {
    return data.map((item) => {
      const filteredItem: any = {};
      columns.forEach((col) => {
        if (col.field === "strategy") {
          // If column name is "Strategy", retrieve data.strategy_fk.display_name
          filteredItem[col.field] = item.strategy_fk?.display_name;
        } else if (item[col.field] !== undefined) {
          // For other columns, just copy the value
          filteredItem[col.field] = item[col.field];
        }
      });
      return filteredItem;
    });
  };
  const handleDialogOpen = (name: string) => {
    if (selectedName === name) {
      return; // Prevent reopening the dialog with the same name
    }

    setSelectedName(name);
    setOpenDialog(true);

    let defaultFormData: any;

    switch (name) {
      case "Monthly Status":
        defaultFormData = {
          update_column: "FUT",
          symbols: "",
          exclude: "",
          _range: "",
        };
        break;
      case "Equity":
        defaultFormData = {
          max_symbols: 7000,
          batch_size: 500,
        };
        break;
      case "Instruments":
        defaultFormData = {
          instruments: "ALL",
          instrument_type: "ALL",
          segment: "Null",
        };
        break;
      case "Compare Data":
        defaultFormData = {
          strategy_names: "ALL",
          chunk_size: 500,
        };
        break;
      default:
        defaultFormData = {};
        break;
    }

    // Update formData only if it's different to avoid unnecessary rerenders
    setFormData((prevState) => {
      if (JSON.stringify(prevState) !== JSON.stringify(defaultFormData)) {
        return defaultFormData;
      }
      return prevState; // Prevent unnecessary state updates if form data is unchanged
    });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedName(null);
    setFormData({}); // Reset form data when closing the dialog
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setLoading(true);
    let updateBlazeUrl = "";
    let body = { ...formData };

    switch (selectedName) {
      case "Monthly Status":
        updateBlazeUrl = "/status/current/update/";
        break;
      case "Equity":
        updateBlazeUrl = "/strategy/bt/equity/";
        break;
      case "Instruments":
        updateBlazeUrl = "/main/instrument/update/daily/";
        break;
      case "Compare Data":
        updateBlazeUrl = "/strategy/orders/missed/";
        break;
      default:
        break;
    }

    try {
      // Assuming `updateBlazePost` is a function to send POST requests
      await updateBlazePost(updateBlazeUrl, body);
      handleDialogClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  function a11yPropsInner(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleChangeInner = (event: React.SyntheticEvent, newValue: number) => {
    setValueInner(newValue);
  };
  const CustomTabPanel: React.FC<TabPanelProps> = React.memo((props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  });

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await axios.get(
          "https://api.quantradeai.com/main/instrument/?paginate=false&?clear_cache=true&segment=NFO-FUT",
          { headers }
        );
        const nfoData = response.data.data.map((x) => x.name);
        setNFOArrayData(nfoData);
      } catch (err) {}
    };
    const fetchSymbols = async () => {
      try {
        const response = await axios.get(
          "https://api.quantradeai.com/strategy/identifier/?paginate=false&?clear_cache=true",
          { headers }
        );
        const Strategynames = response.data.data.map((x) => ({
          display_name: x.display_name,
          name: x.name,
        }));
        setStrategynamesData(Strategynames);
      } catch (err) {}
    };
    const fetchRegenrate = async () => {
      try {
        const response = await axios.get(
          "https://api.quantradeai.com/strategy/regenerate/?paginate=false&?clear_cache=true",
          { headers }
        );
        const Strategynames = response.data.data;
        setRegenrateData(Strategynames);
      } catch (err) {}
    };
    fetchSymbols();
    fetchInstruments();
    fetchRegenrate();
  }, []); // }

  async function handleAutocompleteChange(strategyName, field, newValue) {
    // Update the selected values
    const updatedValues = { ...selectedValues };
    if (!updatedValues[strategyName]) updatedValues[strategyName] = {};

    updatedValues[strategyName][field] = newValue;
    setSelectedValues(updatedValues);

    if (field === "symbol" && newValue.length > 0) {
      let symbol = Array.isArray(newValue) ? newValue[0] : newValue;
      if(strategyName === "IndicesOptionBuyingIntraday") {
        const fetchedExpiryDates = await fetchExpiryDates(symbol, strategyName);
        setExpiryDates((prev) => ({
          ...prev,
          [strategyName]: fetchedExpiryDates,
        }));
      }
      else if (!expiryDates[strategyName] || expiryDates[strategyName].expiry == null) {
        if (symbol === "All") {
          symbol = "INfY"; 
        }
        const fetchedExpiryDates = await fetchExpiryDates(symbol, strategyName);
        setExpiryDates((prev) => ({
          ...prev,
          [strategyName]: fetchedExpiryDates,
        }));
      }
    }
  }

  const fetchExpiryDates = async (symbol, strategyName) => {
    const instrumentType = strategyName.includes("Future") ? "FUT" : "CE";
    const requestParams = {
      symbol,
      instrument_type: instrumentType,
    };
    try {
      const response = await axios.post(
        "https://api.quantradeai.com/main/instrument/expiry/",
        requestParams,
        {
          headers,
        }
      );
      response.data.data.unshift("Select Date");
      return response.data.data || [];
    } catch (error) {
      console.error(error);
      return []; // Return an empty array in case of an error
    }
  };
  const handleUpdateClick = async (name: string) => {
    setLoadingState((prevState) => ({
      ...prevState,
      [name]: true,
    }));
    const selectedSymbol = selectedValues[name]?.symbol || [];
    const selectedExclude = selectedValues[name]?.exclude || [];
    const expiryDate = selectedValues[name]?.expiry || "";
    const batchSize = selectedValues[name]?.batchSize || "3";
    const sleepTime = selectedValues[name]?.sleepTime || "2";

    const requestData = {
      symbols: selectedSymbol,
      exclude: selectedExclude,
      strategy_name: name,
      batch_size: +batchSize, // You can update based on input field or condition
      sleep_time: +sleepTime, // You can update based on input field or condition
      expiry_date: expiryDate,
    };

    try {
      const response = await axios.post(
        "https://api.quantradeai.com/strategy/generate/",
        requestData,
        {
          headers
        }
      );
      if (response) {
        swal("Updated!", "Successfully updated strategy!", "success");
        //console.log('Successfully updated strategy:', response);
      } else {
        swal("Error!", "Error updating strategy!", "error");
        //console.error('Error updating strategy:', response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoadingState((prevState) => ({
      ...prevState,
      [name]: false,
    }))
  };
  const [selectedRows, setSelectedRows] = useState<any>([]);
const[SelectedData,SetSelectedData]= useState<any>([]);
  const handleSelectionChange = (rowSelectionModel) => {
    setSelectedRows(rowSelectionModel);
   // SetSelectedData(rowSelectionModel);
  };

const HandelRowSeleted = async () => {
  const currentData =
    valueinner === 0 ? missedData :
    valueinner === 1 ? slData :
    rejectedData;

  const selectedRowData = currentData.filter((row:any) => SelectedData.includes(row.id));

  const selectedSymbol = selectedRowData.map((row) => row.rejected_symbols||row.rejected_symbols);
  const strategyname = selectedRowData.map((row) => row.strategy_fk.name);
  const expiryDate = selectedRowData.map((row) => row.expiry);

  const requestData = {
    symbols: selectedSymbol,
    strategy_name: strategyname,
    batch_size: 3,
    sleep_time: 1,
    expiry_date: expiryDate,
  };

  try {
    // Make the POST request to the API
    const response = await axios.post(
      "https://api.quantradeai.com/strategy/generate/",
      requestData,
      {
        headers
      }
    );

    if (response) {
      swal("Updated!", "Successfully updated strategy!", "success");
    } else {
      swal("Error!", "Error updating strategy!", "error");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

  return (
    <Box
      sx={{
        height: "auto",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
        marginLeft: "15px",
        padding: "40px",
        background: "white",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 398,
          background: "white",
          marginBottom: 2,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Update" {...a11yProps(0)} />
          <Tab label="Re-Generate" {...a11yProps(1)} />
        </Tabs>
        <CustomTabPanel value={value} index={0}>
          <Paper sx={{ height: 270, width: "100%" }}>
            <Box>
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Average Time</TableCell>
                      <TableCell>Last Update</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      "Instruments",
                      "Monthly Status",
                      "Equity",
                      "Compare Data",
                    ].map((name) => (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => handleDialogOpen(name)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>{" "}
            </Box>
          </Paper>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Paper sx={{ height: 270, width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                height: 398,
                background: "white",
              }}
            >
              <Tabs
                value={valueinner}
                onChange={handleChangeInner}
                aria-label="basic tabs example"
              >
                <Tab label="Missed" {...a11yPropsInner(0)} />
                <Tab label="SL" {...a11yPropsInner(1)} />
                <Tab label="Rejected" {...a11yPropsInner(2)} />
              </Tabs>
              

      {/* Missed Tab */}
      <CustomTabPanel value={valueinner} index={0}>
        <Paper sx={{ height: 270, width: "100%" }}>
          <DataGrid
            rows={filterRegenrateData(missedData, columnsMissed)}
            columns={columnsMissed}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            rowSelectionModel={selectedRows}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { paddingLeft: "8px" },
              "& .MuiDataGrid-cell": { padding: "8px 12px" },
              columnSpacing: 2,
            }}
            hideFooterPagination={true}
            hideFooter={true}
            localeText={{ noRowsLabel: "No records found" }}
            getRowId={(row) => row.id}
          />
        </Paper>
      </CustomTabPanel>

      {/* SL Tab */}
      <CustomTabPanel value={valueinner} index={1}>
        <Paper sx={{ height: 270, width: "100%" }}>
          <DataGrid
           rows={filterRegenrateData(slData, columnsSL)}  // Your data
           columns={columnsSL}  // Your columns
           checkboxSelection
           onRowSelectionModelChange={handleSelectionChange}  // Update selected rows
           rowSelectionModel={selectedRows.selectionModel}  // Pass selected row IDs here
           hideFooterPagination={true}
           hideFooter={true}
           sx={{
             border: 0,
             "& .MuiDataGrid-columnHeaders": { paddingLeft: "8px" },
             "& .MuiDataGrid-cell": { padding: "8px 12px" },
             columnSpacing: 2,
           }}
           localeText={{ noRowsLabel: "No records found" }}
           getRowId={(row) => row.id}
          />
        </Paper>
      </CustomTabPanel>

      {/* Rejected Tab */}
      <CustomTabPanel value={valueinner} index={2}>
        <Paper sx={{ height: 270, width: "100%" }}>
          <DataGrid
            rows={filterRegenrateData(rejectedData, columnsRejected)}
            columns={columnsRejected}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { paddingLeft: "8px" },
              "& .MuiDataGrid-cell": { padding: "8px 12px" },
              columnSpacing: 2,
            }}
            hideFooterPagination={true}
            hideFooter={true}
            localeText={{ noRowsLabel: "No records found" }}
            getRowId={(row) => row.id}
          />
        </Paper>
      </CustomTabPanel>

      <div className="Regenerate">
        <Button variant="contained" onClick={HandelRowSeleted}>
          Regenerate
        </Button>
      </div>
    </Box>
  </Paper>
</CustomTabPanel>
      </Box>
      <Box
        sx={{
          width: "100%",
          background: "white",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginTop: 4,
          borderRadius: "8px",
          padding: "30px 15px",
        }}
      >
        <Table style={value == 0 ? { display: "block" } : { display: "none" }}>
          <TableBody>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="right" colSpan={4}>
                <Accordion
                  expanded={expandAccordion ? true : false}
                  onChange={() => setExpandAccordion((prevState) => !prevState)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Future and Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer
                      sx={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Strategy</TableCell>
                            <TableCell>Exclude</TableCell>
                            <TableCell>Symbol</TableCell>
                            <TableCell>Batch Size</TableCell>
                            <TableCell>Sleep Time</TableCell>
                            <TableCell>Expiry Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {strategynames.map((strategy) => (
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                              key={strategy.name}
                            >
                              <TableCell>{strategy.display_name}</TableCell>

                              {/* Exclude Autocomplete */}
                              <TableCell align="right">
                                <Autocomplete
                                  multiple
                                  disablePortal
                                  options={
                                    [
                                      "Nifty",
                                      "Banknifty",
                                      "Gold Mini",
                                      "Silver Mini",
                                      "Midcpnifty",
                                      "Finnifty",
                                      "Niftynxt50",
                                    ].some((name) =>
                                      strategy.name.includes(name)
                                    )
                                      ? []
                                      : ["All", ...new Set(nfoArrayData)].sort()
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Exclude" />
                                  )}
                                  value={
                                    selectedValues[strategy.name]?.exclude || []
                                  }
                                  onChange={(event, newValue) => {
                                    event.preventDefault();
                                    handleAutocompleteChange(
                                      strategy.name,
                                      "exclude",
                                      newValue
                                    );
                                  }}
                                  style={{ maxWidth: "600px" }}
                                  disabled={[
                                    "Nifty",
                                    "Banknifty",
                                    "GoldMini",
                                    "SilverMini",
                                    "Midcpnifty",
                                    "Finnifty",
                                    "Niftynxt50",
                                    "Indices",
                                  ].some((name) =>
                                    strategy.name.includes(name)
                                  )}
                                />
                              </TableCell>

                              {/* Symbol Autocomplete */}
                              <TableCell align="right">
                                <Autocomplete
                                  multiple={
                                    !(
                                      strategy.name.includes("Nifty") ||
                                      strategy.name.includes("Bank") ||
                                      strategy.name.includes("GoldMini") ||
                                      strategy.name.includes("SilverMini") ||
                                      strategy.name.includes("Midcpnifty") ||
                                      strategy.name.includes("Finnifty") ||
                                      strategy.name.includes("Niftynxt50")
                                    )
                                  }
                                  disablePortal
                                  options={
                                    strategy.name.includes("BankNifty")
                                      ? ["BANKNIFTY"]
                                      : strategy.name.includes("Nifty") &&
                                          !strategy.name.includes("BankNifty")
                                        ? ["NIFTY"]
                                        : strategy.name.includes("GoldMini")
                                          ? ["GOLDM"]
                                          : strategy.name.includes("SilverMini")
                                            ? ["SILVERM"]
                                            : strategy.name.includes(
                                                  "Midcpnifty"
                                                )
                                              ? ["MIDCPNIFTY"]
                                              : strategy.name.includes(
                                                    "Finnifty"
                                                  )
                                                ? ["FINNIFTY"]
                                                : strategy.name.includes(
                                                      "Niftynxt50"
                                                    )
                                                  ? ["NIFTYNXT50"]
                                                  : strategy.name.includes(
                                                        "Indices"
                                                      )
                                                    ? [
                                                        "NIFTY",
                                                        "BANKNIFTY",
                                                        "FINNIFTY",
                                                        "MIDCPNIFTY",
                                                        "NIFTYNXT50",
                                                      ]
                                                    : [
                                                        "All",
                                                        ...new Set(
                                                          nfoArrayData
                                                        ),
                                                      ].sort()
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Symbol" />
                                  )}
                                  value={
                                    selectedValues[strategy.name]?.symbol || []
                                  }
                                  onChange={async (event, newValue) => {
                                    event.preventDefault();
                                    handleAutocompleteChange(
                                      strategy.name,
                                      "symbol",
                                      newValue
                                    );

                                    // Fetch expiry date for the first symbol selected
                                    // if (newValue && newValue.length > 0) {
                                    //   const symbol = newValue[0]; // Take the first selected symbol
                                    //   const strategyName = strategy.name;
                                    //   const fetchedExpiryDates =
                                    //     await fetchExpiryDates(
                                    //       symbol,
                                    //       strategyName
                                    //     );
                                    //   setExpiryDates((prev) => ({
                                    //     ...prev,
                                    //     [strategyName]: fetchedExpiryDates,
                                    //   }));
                                    // }
                                  }}
                                />
                              </TableCell>

                              {/* Batch Size */}
                              <TableCell align="right">
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={
                                    selectedValues[strategy.name]?.batchSize ||
                                    "3"
                                  }
                                  sx={{
                                    "& .MuiInputBase-root": { height: 50 },
                                    "& .MuiInputBase-input": {
                                      fontSize: "14px",
                                    },
                                  }}
                                  onChange={(e) =>
                                    handleAutocompleteChange(
                                      strategy.name,
                                      "batchSize",
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>

                              {/* Sleep Time */}
                              <TableCell align="right">
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={
                                    selectedValues[strategy.name]?.sleepTime ||
                                    "2"
                                  }
                                  sx={{
                                    "& .MuiInputBase-root": { height: 50 },
                                    "& .MuiInputBase-input": {
                                      fontSize: "14px",
                                    },
                                  }}
                                  onChange={(e) =>
                                    handleAutocompleteChange(
                                      strategy.name,
                                      "sleepTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>

                              {/* Expiry Date */}
                              <TableCell align="right">
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  type="date"
                                  size="small"
                                  select
                                  SelectProps={{ native: true }}
                                  value={
                                    selectedValues[strategy.name]?.expiry || ""
                                  }
                                  onChange={(e) =>
                                    handleAutocompleteChange(
                                      strategy.name,
                                      "expiry",
                                      e.target.value
                                    )
                                  }
                                  sx={{
                                    "& .MuiInputBase-root": { height: 50 },
                                    "& .MuiInputBase-input": {
                                      fontSize: "14px",
                                    },
                                  }}
                                >
                                  {expiryDates[strategy.name]?.map((expiry) => (
                                    <option key={expiry} value={expiry}>
                                      {expiry}
                                    </option>
                                  ))}
                                </TextField>
                              </TableCell>

                              {/* Update Button */}
                              <TableCell align="right">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleUpdateClick(strategy.name)
                                  }
                                >
                                  {loadingState[strategy.name] ? (
                                      <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                      "Generate"
                                    )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/* </Paper>{" "}
        </CustomTabPanel> */}
      </Box>
      {/* Dialog for Update */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Update {selectedName}</DialogTitle>
        <DialogContent>
          {selectedName && (
            <>
              {/* Render Dynamic Input Fields based on selectedName */}
              {selectedName === "Monthly Status" && (
                <>
                  <TextField
                    label="Update Column"
                    name="update_column"
                    value={formData.update_column}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Symbols"
                    name="symbols"
                    value={formData.symbols}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Exclude"
                    name="exclude"
                    value={formData.exclude}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Range"
                    name="_range"
                    value={formData._range}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </>
              )}
              {selectedName === "Equity" && (
                <>
                  <TextField
                    label="Max Symbols"
                    name="max_symbols"
                    value={formData.max_symbols}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                  />
                  <TextField
                    label="Batch Size"
                    name="batch_size"
                    value={formData.batch_size}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                  />
                </>
              )}
              {selectedName === "Instruments" && (
                <>
                 <Box display="flex" flexDirection="column" width="100%" gap={2}>
                  <FormControl variant="outlined" size="small">
                      <InputLabel id="instrument-select-label">Instruments</InputLabel>
                      <Select
                        name="instrument_type"
                        value={formData.instruments}
                        onChange={(e: any) => handleInputChange(e)}
                        label="Instrument Type"
                        fullWidth
                      >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="NSE">NSE</MenuItem>
                        <MenuItem value="BSE">BSE</MenuItem>
                        <MenuItem value="MCX">MCX</MenuItem>
                        <MenuItem value="NFO">NFO</MenuItem>
                      </Select>
                    </FormControl>
                  <FormControl variant="outlined" size="small">
                      <InputLabel id="instrument-select-label">Instrument Type</InputLabel>
                      <Select
                        name="instrument_type"
                        value={formData.instrument_type}
                        onChange={(e: any) => handleInputChange(e)}
                        label="Instrument Type"
                        fullWidth
                      >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="EQ">Cash</MenuItem>
                        <MenuItem value="FUT">Futures</MenuItem>
                        <MenuItem value="CE">CE</MenuItem>
                        <MenuItem value="PE">PE</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" size="small">
                      <InputLabel id="instrument-select-label">Segment</InputLabel>
                      <Select
                        name="segment"
                        value={formData.segment}
                        onChange={(e: any) => handleInputChange(e)}
                        label="Segment"
                        fullWidth
                      >
                        <MenuItem value="Null">All</MenuItem>
                        <MenuItem value="NFO-OPT">NFO-OPT</MenuItem>
                        <MenuItem value="NFO-FUT">NFO-FUT</MenuItem>
                        <MenuItem value="MCX-OPT">MCX-OPT</MenuItem>
                        <MenuItem value="MCX-FUT">MCX-FUT</MenuItem>
                        <MenuItem value="BFO-OPT">BFO-OPT</MenuItem>
                        <MenuItem value="BFO-FUT">BFO-FUT</MenuItem>
                      </Select>
                    </FormControl>
                    </Box>
                </>
              )}
              {selectedName === "Compare Data" && (
                <>
                  <TextField
                    label="Strategy Names"
                    name="strategy_names"
                    value={formData.strategy_names}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Chunk Size"
                    name="chunk_size"
                    value={formData.chunk_size}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={loading}
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
