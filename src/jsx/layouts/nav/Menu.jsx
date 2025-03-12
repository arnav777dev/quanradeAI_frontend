const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
const accessToken = token ? JSON.parse(token).access : "";
const SuperUser = token && JSON.parse(token).user.is_superuser === true ? true : false;
const Staff = token && JSON.parse(token).user.is_staff === true ? true : false;
const is_equity_Analiysis = token && JSON.parse(token).user.blaze_product_permissions.is_equity_analysis;
const is_equity_orders = token && JSON.parse(token).user.blaze_product_permissions.is_equity_orders;
const is_fo_analysis = token && JSON.parse(token).user.blaze_product_permissions.is_fo_analysis;
const is_fo_orders = token && JSON.parse(token).user.blaze_product_permissions.is_fo_orders;
const is_monthly_status = token && JSON.parse(token).user.blaze_product_permissions.is_monthly_status;

let MenuList = [];

if (!SuperUser || !Staff) {
    MenuList = [
        {
            title: 'Dashboard',
            to: 'dashboard',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">dashboard</i>,
        },
        {
            title: 'Broker Login',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'broker-login',
        },
    ];

    // Equity menu items conditionally based on permissions
    if (is_equity_Analiysis || is_equity_orders) {
        MenuList.push({
            title: 'Equity',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'equity',
            content: [
                is_equity_Analiysis && {
                    title: 'Equity Analysis',
                    to: 'equity-data',
                },
                is_equity_orders && {
                    title: 'Orders',
                    to: 'equity-orders',
                },
            ].filter(Boolean), // Filters out falsy values like `false`
        });
    }
    // F&O menu items conditionally based on permissions
    else if (is_fo_analysis || is_fo_orders || is_monthly_status) {
        MenuList.push({
            title: 'F&O',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'future',
            content: [
                is_monthly_status && {
                    title: 'Monthly Status',
                    to: 'monthly-status',
                },
                is_fo_analysis && {
                    title: 'Index Option Buying',
                    to: 'Index-Option-Buying',
                },
                {
                    title: 'Index Future',
                    to: 'Index-Future',
                },
                {
                    title: 'Stock Future',
                    to: 'Stock-Future',
                },
                {
                    title: 'Stock Option Selling',
                    to: 'Stock-Option-Selling',
                },
                {
                    title: 'Stock Option Buying',
                    to: 'Stock-Option-Buying',
                },
                {
                    title: 'Commodity',
                    to: 'Commodity',
                },
                is_fo_orders && {
                    title: 'Orders',
                    to: 'future-orders',
                },
            ].filter(Boolean),
        });
    }
    MenuList.push(
        {
            title: 'Fund Management',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'fund-management',
        }
    );

} else {
    MenuList = [
        // Common menu items for SuperUser or Staff
        {
            title: 'Dashboard',
            to: 'dashboard',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">dashboard</i>,
        },
        {
            title: 'Broker Login',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'broker-login',
        },
        {
            title: 'Users',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'all-users',
        },
    ];

    // Equity menu items
    MenuList.push({
        title: 'Equity',
        classsChange: 'mm-collapse',
        iconStyle: <i className="material-symbols-outlined">monitoring</i>,
        to: 'equity',
        content: [
            {
                title: 'Equity Analysis',
                to: 'equity-data',
            },
            {
                title: 'Orders',
                to: 'equity-orders',
            },
        ],
    });

    // F&O menu items
    MenuList.push({
        title: 'F&O',
        classsChange: 'mm-collapse',
        iconStyle: <i className="material-symbols-outlined">monitoring</i>,
        to: 'future',
        content: [
            {
                title: 'Monthly Status',
                to: 'monthly-status',
            },
            {
                title: 'Index Option Buying',
                to: 'Index-Option-Buying',
            },
            {
                title: 'Index Future',
                to: 'Index-Future',
            },
            {
                title: 'Stock Future',
                to: 'Stock-Future',
            },
            {
                title: 'Stock Option Selling',
                to: 'Stock-Option-Selling',
            },
            {
                title: 'Stock Option Buying',
                to: 'Stock-Option-Buying',
            },
            {
                title: 'Commodity',
                to: 'Commodity',
            },
            {
                title: 'Orders',
                to: 'future-orders',
            },
        ],
    });

    MenuList.push(
        {
            title: 'Fund Management',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'fund-management',
        },
        {
            title: 'Update Blaze',
            classsChange: 'mm-collapse',
            iconStyle: <i className="material-symbols-outlined">monitoring</i>,
            to: 'update-blaze',
        }
    );
}

export { MenuList };
