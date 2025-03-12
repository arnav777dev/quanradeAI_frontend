 export type  Employee = {
    ID: string;
    full_name: string;
    username: string;
    email: string;
    contact: any;
    is_active: number;
    is_user: string;
    date_joined: string;
    aadhaar_card: string;
    pan_card: string;
    address: any;
    is_equity_analysis: string;
    is_equity_orders: string;
    is_equity_rms: string;
    is_fo_analysis: string;
    is_fo_orders: string;
    is_fo_rms: string;
    is_monthly_status: string;
  };

  type UserDetailPanelProps = {
    row: {
      original: Employee;  // Assuming you are passing row.original as the data
    };
  };