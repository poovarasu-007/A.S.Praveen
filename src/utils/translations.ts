export interface TranslationDictionary {
  [key: string]: string;
  // Brand & Common
  brandName: string;
  brandSub: string;
  systemOnline: string;
  offlineMode: string;
  backupReminderTitle: string;
  backupReminderMsg: string;
  backupNow: string;
  loading: string;
  save: string;
  cancel: string;
  close: string;
  delete: string;
  edit: string;
  view: string;
  print: string;
  search: string;
  filter: string;
  all: string;
  actions: string;
  status: string;
  confirm: string;
  success: string;
  error: string;
  warning: string;
  back: string;
  next: string;
  refresh: string;
  exportExcel: string;
  exportCsv: string;
  noData: string;
  date: string;
  time: string;
  user: string;
  role: string;

  // Navigation
  navNavigation: string;
  navAdministration: string;
  dashboard: string;
  billing: string;
  products: string;
  customers: string;
  billHistory: string;
  reports: string;
  backup: string;
  users: string;
  settings: string;
  auditLogs: string;
  logout: string;

  // Auth & Roles
  welcomeBack: string;
  signInSubtitle: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  forgotPassword: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  verificationCode: string;
  verificationCodePlaceholder: string;
  newPassword: string;
  newPasswordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  resetPasswordButton: string;
  backToLogin: string;
  createAccountTitle: string;
  createAccountSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  phoneNumber: string;
  phoneNumberPlaceholder: string;
  adminSecretKey: string;
  adminSecretKeyPlaceholder: string;
  createAccountButton: string;
  dontHaveAccount: string;
  registerNow: string;
  roleAdmin: string;
  roleManager: string;
  roleOperator: string;
  loginHeroEyebrow: string;
  loginHeroTitle: string;
  loginHeroCaption: string;
  loginHeroFeatureOffline: string;
  loginHeroFeatureGst: string;
  loginHeroFeaturePrint: string;
  loginImageAlt: string;

  // Dashboard
  todaySales: string;
  todayBills: string;
  totalCustomers: string;
  lowStockItems: string;
  recentBills: string;
  quickActions: string;
  newBillButton: string;
  viewHistoryButton: string;
  viewProductsButton: string;
  lowStockAlertTitle: string;
  lowStockAlertMsg: string;
  stockLeft: string;
  minAlert: string;
  noRecentBills: string;
  noLowStock: string;

  // Billing Counter
  customerDetails: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  gstin: string;
  productSelection: string;
  searchProductPlaceholder: string;
  fixedRate: string;
  qty: string;
  unit: string;
  gstRate: string;
  amount: string;
  addProduct: string;
  increaseQuantity: string;
  decreaseQuantity: string;
  removeItem: string;
  subtotal: string;
  cgst: string;
  sgst: string;
  igst: string;
  roundOff: string;
  grandTotal: string;
  amountInWords: string;
  paymentMethod: string;
  amountReceived: string;
  balance: string;
  clearBill: string;
  printPreview: string;
  saveAndPrint: string;
  saveBill: string;
  paymentCash: string;
  paymentUpi: string;
  paymentCard: string;
  paymentCredit: string;
  billSavedSuccess: string;
  itemAlreadyAdded: string;
  pleaseSelectProduct: string;
  enterValidQty: string;
  gstMode: string;
  gstModeCgstSgst: string;
  gstModeIgst: string;
  gstModeExempted: string;

  // Product Master
  addProductTitle: string;
  editProductTitle: string;
  productName: string;
  productCategory: string;
  hsnCode: string;
  sellingPrice: string;
  purchasePrice: string;
  stockQuantity: string;
  minStockAlert: string;
  unitType: string;
  activeStatus: string;
  deleteProductConfirm: string;
  productAddedMsg: string;
  productUpdatedMsg: string;
  productDeletedMsg: string;

  // Categories
  catAll: string;
  catSeeds: string;
  catFertilizers: string;
  catPesticides: string;
  catOrganicManure: string;
  catAgriTools: string;
  catIrrigation: string;
  catPlantGrowth: string;
  catCropProtection: string;
  catBioFertilizers: string;
  catFarmingAccessories: string;
  catOther: string;

  // Customer Management
  addCustomerTitle: string;
  editCustomerTitle: string;
  totalPurchases: string;
  outstandingBalance: string;
  villageTown: string;
  customerAddedMsg: string;
  customerUpdatedMsg: string;
  customerDeletedMsg: string;

  // History & Invoices
  billNumber: string;
  billDate: string;
  invoiceType: string;
  thermalInvoice: string;
  a4Invoice: string;
  cancelBillConfirm: string;
  billCancelledMsg: string;
  printInvoice: string;
  downloadPdf: string;
  billDetails: string;
  itemsList: string;

  // Reports
  today: string;
  thisWeek: string;
  thisMonth: string;
  customRange: string;
  totalRevenue: string;
  cashSales: string;
  upiSales: string;
  creditSales: string;
  taxCollected: string;
  topSellingProducts: string;

  // Backup & Settings
  downloadBackup: string;
  restoreBackup: string;
  resetDatabase: string;
  businessName: string;
  tagline: string;
  businessAddress: string;
  phone1: string;
  phone2: string;
  email: string;
  defaultGstMode: string;
  thermalPaperWidth: string;
  enableRoundOff: string;
  backupReminderDays: string;
  settingsSavedMsg: string;

  // Audit Logs
  auditAction: string;
  auditRecord: string;
  auditDetails: string;
  auditTime: string;

  // Language selector
  languageName: string;
  switchLanguage: string;
}

const baseTranslations: Record<'en' | 'ta', TranslationDictionary> = {
  en: {
    // Brand & Common
    brandName: 'A.S. PRAVEEN TRADERS',
    brandSub: 'AGRICULTURAL BILLING SYSTEM',
    systemOnline: 'System Online',
    offlineMode: 'Offline Mode (Local Storage Active)',
    backupReminderTitle: 'Backup Reminder',
    backupReminderMsg: 'Your last backup was {days} days ago.',
    backupNow: 'Backup Now',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    print: 'Print',
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    actions: 'Actions',
    status: 'Status',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    back: 'Back',
    next: 'Next',
    refresh: 'Refresh',
    exportExcel: 'Export Excel',
    exportCsv: 'Export CSV',
    noData: 'No records found',
    date: 'Date',
    time: 'Time',
    user: 'User',
    role: 'Role',

    // Navigation
    navNavigation: 'Navigation',
    navAdministration: 'Administration',
    dashboard: 'Dashboard',
    billing: 'Billing Counter',
    products: 'Product Master',
    customers: 'Customers',
    billHistory: 'Bill History',
    reports: 'Sales Reports',
    backup: 'Backup & Restore',
    users: 'User Accounts',
    settings: 'Business Settings',
    auditLogs: 'Audit Logs',
    logout: 'Logout',

    // Auth & Roles
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to access the agricultural billing counter',
    loginHeroEyebrow: 'Agricultural Billing System',
    loginHeroTitle: 'Every farm bill, counted and recorded',
    loginHeroCaption: 'Bill seeds, fertilizer and farm inputs for farmers across Tamil Nadu — with GST-ready totals and thermal printing.',
    loginHeroFeatureOffline: 'Works offline',
    loginHeroFeatureGst: 'GST ready',
    loginHeroFeaturePrint: 'Thermal & A4 print',
    loginImageAlt: 'Farmers working in a green agricultural field using traditional bullock ploughing and modern farming machinery',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    forgotPassword: 'Forgot password?',
    forgotPasswordTitle: 'Reset Password',
    forgotPasswordSubtitle: 'Enter your username and verification code to reset',
    resetPasswordTitle: 'Set New Password',
    resetPasswordSubtitle: 'Enter a strong new password for your account',
    verificationCode: 'Verification / Admin Code',
    verificationCodePlaceholder: 'Enter code provided by Admin',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter minimum 4 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    resetPasswordButton: 'Reset Password',
    backToLogin: 'Back to Sign In',
    createAccountTitle: 'Create New Account',
    createAccountSubtitle: 'Register a new billing staff account',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter staff full name',
    phoneNumber: 'Phone Number',
    phoneNumberPlaceholder: '10-digit mobile number',
    adminSecretKey: 'Admin Secret Key',
    adminSecretKeyPlaceholder: 'Required to authorize new user registration',
    createAccountButton: 'Create Account',
    dontHaveAccount: "Don't have an account?",
    registerNow: 'Register new user',
    roleAdmin: 'Administrator',
    roleManager: 'Billing Manager',
    roleOperator: 'Counter Operator',

    // Dashboard
    todaySales: "Today's Total Sales",
    todayBills: "Today's Invoices",
    totalCustomers: 'Registered Farmers / Customers',
    lowStockItems: 'Low Stock Alerts',
    recentBills: 'Recent Invoices',
    quickActions: 'Quick Actions',
    newBillButton: '+ New Bill (F2)',
    viewHistoryButton: 'View History',
    viewProductsButton: 'Manage Products',
    lowStockAlertTitle: 'Inventory Stock Alerts',
    lowStockAlertMsg: 'The following items are running below reorder threshold:',
    stockLeft: 'Stock left',
    minAlert: 'Min alert',
    noRecentBills: 'No bills generated today yet.',
    noLowStock: 'All product inventory levels are healthy.',

    // Billing Counter
    customerDetails: 'Customer / Farmer Details',
    customerName: 'Customer / Farmer Name',
    customerMobile: 'Mobile Number',
    customerAddress: 'Village / Town / Address',
    gstin: 'GSTIN (Optional)',
    productSelection: 'Item Entry & Selection',
    searchProductPlaceholder: 'Search by product name, HSN code, or category...',
    fixedRate: 'Rate (₹)',
    qty: 'Quantity',
    unit: 'Unit',
    gstRate: 'GST %',
    amount: 'Amount (₹)',
    addProduct: '+ Add Item',
    increaseQuantity: 'Increase quantity',
    decreaseQuantity: 'Decrease quantity',
    removeItem: 'Remove item',
    subtotal: 'Taxable Subtotal',
    cgst: 'CGST',
    sgst: 'SGST',
    igst: 'IGST',
    roundOff: 'Round Off',
    grandTotal: 'Grand Total',
    amountInWords: 'Amount in Words',
    paymentMethod: 'Payment Mode',
    amountReceived: 'Amount Received (₹)',
    balance: 'Change Due (₹)',
    clearBill: 'Clear Bill',
    printPreview: 'Preview',
    saveAndPrint: 'SAVE & PRINT',
    saveBill: 'Save Only',
    paymentCash: 'Cash',
    paymentUpi: 'UPI / QR',
    paymentCard: 'Card',
    paymentCredit: 'Credit (Udhari)',
    billSavedSuccess: 'Bill saved successfully!',
    itemAlreadyAdded: 'This product is already in the bill. Quantity updated.',
    pleaseSelectProduct: 'Please select a valid product.',
    enterValidQty: 'Please enter a valid quantity greater than 0.',
    gstMode: 'Tax Mode',
    gstModeCgstSgst: 'CGST + SGST (Intra-State)',
    gstModeIgst: 'IGST (Inter-State)',
    gstModeExempted: 'Exempted / Non-GST',

    // Product Master
    addProductTitle: 'Add New Product',
    editProductTitle: 'Edit Product Details',
    productName: 'Product / Item Name',
    productCategory: 'Category',
    hsnCode: 'HSN / SAC Code',
    sellingPrice: 'Selling Rate (₹)',
    purchasePrice: 'Purchase Cost (₹)',
    stockQuantity: 'Current Stock Quantity',
    minStockAlert: 'Low Stock Alert Threshold',
    unitType: 'Unit of Measure',
    activeStatus: 'Active / Available for Billing',
    deleteProductConfirm: 'Are you sure you want to delete this product?',
    productAddedMsg: 'Product added successfully!',
    productUpdatedMsg: 'Product updated successfully!',
    productDeletedMsg: 'Product removed.',

    // Categories
    catAll: 'All Categories',
    catSeeds: 'Seeds',
    catFertilizers: 'Fertilizers',
    catPesticides: 'Pesticides',
    catOrganicManure: 'Organic Manure',
    catAgriTools: 'Agricultural Tools',
    catIrrigation: 'Irrigation Equipment',
    catPlantGrowth: 'Plant Growth Regulators',
    catCropProtection: 'Crop Protection',
    catBioFertilizers: 'Bio-Fertilizers',
    catFarmingAccessories: 'Farming Accessories',
    catOther: 'General Inputs',

    // Customer Management
    addCustomerTitle: 'Add Customer',
    editCustomerTitle: 'Edit Customer',
    totalPurchases: 'Total Purchases',
    outstandingBalance: 'Pending Balance',
    villageTown: 'Village / Town',
    customerAddedMsg: 'Customer recorded successfully!',
    customerUpdatedMsg: 'Customer updated!',
    customerDeletedMsg: 'Customer removed.',

    // History & Invoices
    billNumber: 'Bill #',
    billDate: 'Date',
    invoiceType: 'Invoice Format',
    thermalInvoice: 'Thermal Slip (3-inch)',
    a4Invoice: 'A4 / A5 Tax Invoice',
    cancelBillConfirm: 'Are you sure you want to cancel this bill? Stock will be restored.',
    billCancelledMsg: 'Bill has been cancelled.',
    printInvoice: 'Print Bill',
    downloadPdf: 'Download PDF',
    billDetails: 'Invoice Inspection',
    itemsList: 'Purchased Items',

    // Reports
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    customRange: 'Custom Date Range',
    totalRevenue: 'Total Revenue',
    cashSales: 'Cash Receipts',
    upiSales: 'UPI Digital Receipts',
    creditSales: 'Credit Sales',
    taxCollected: 'Total GST Collected',
    topSellingProducts: 'Top Selling Products',

    // Backup & Settings
    downloadBackup: 'Download Full JSON Backup',
    restoreBackup: 'Restore Database from JSON',
    resetDatabase: 'Reset Billing Database',
    businessName: 'Business / Shop Name',
    tagline: 'Tagline / Slogan',
    businessAddress: 'Shop Address',
    phone1: 'Primary Contact Mobile',
    phone2: 'Secondary Contact Mobile',
    email: 'Business Email',
    defaultGstMode: 'Default GST Mode',
    thermalPaperWidth: 'Thermal Print Width',
    enableRoundOff: 'Enable Auto Round-Off',
    backupReminderDays: 'Backup Reminder Interval (Days)',
    settingsSavedMsg: 'Business settings saved successfully!',

    // Audit Logs
    auditAction: 'Action Performed',
    auditRecord: 'Target Module',
    auditDetails: 'Activity Description',
    auditTime: 'Timestamp',

    // Language selector
    languageName: 'English',
    switchLanguage: 'Switch language',
  },

  ta: {
    // Brand & Common
    brandName: 'ஏ.எஸ். பிரவீன் டிரேடர்ஸ்',
    brandSub: 'விவசாய பொருட்கள் பில்லிங் சிஸ்டம்',
    systemOnline: 'இணைப்பில் உள்ளது (Online)',
    offlineMode: 'ஆஃப்லைன் முறை (உள் சேமிப்பகம் இயங்குகிறது)',
    backupReminderTitle: 'காப்பு நினைவூட்டல் (Backup)',
    backupReminderMsg: 'கடைசி காப்புப்பிரதி எடுத்து {days} நாட்கள் ஆகிவிட்டன.',
    backupNow: 'இப்போதே சேமிக்கவும்',
    loading: 'ஏற்றுகிறது...',
    save: 'சேமிக்க',
    cancel: 'ரத்து செய்',
    close: 'மூடுக',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    view: 'பார்வையிடு',
    print: 'அச்சிடு',
    search: 'தேடுக...',
    filter: 'வடிகட்டு',
    all: 'அனைத்தும்',
    actions: 'செயல்கள்',
    status: 'நிலை',
    confirm: 'உறுதி செய்',
    success: 'வெற்றி',
    error: 'பிழை',
    warning: 'எச்சரிக்கை',
    back: 'பின்செல்',
    next: 'அடுத்து',
    refresh: 'புதுப்பி',
    exportExcel: 'Excel ஏற்றுமதி',
    exportCsv: 'CSV ஏற்றுமதி',
    noData: 'தகவல்கள் எதுவும் இல்லை',
    date: 'தேதி',
    time: 'நேரம்',
    user: 'பயனாளர்',
    role: 'பொறுப்பு',

    // Navigation
    navNavigation: 'முதன்மை வழிகாட்டல்',
    navAdministration: 'நிர்வாகப் பகுதி',
    dashboard: 'முகப்பு பலகை',
    billing: 'புதிய பில் (Billing)',
    products: 'பொருட்கள் பட்டியல்',
    customers: 'விவசாயிகள் / வாடிக்கையாளர்கள்',
    billHistory: 'பில் வரலாறு',
    reports: 'விற்பனை அறிக்கைகள்',
    backup: 'காப்புப்பிரதி (Backup)',
    users: 'பயனாளர் கணக்குகள்',
    settings: 'வணிக அமைப்புகள்',
    auditLogs: 'தணிக்கை பதிவு (Audit Log)',
    logout: 'வெளியேறு',

    // Auth & Roles
    welcomeBack: 'வணக்கம், மீண்டும் வருக!',
    signInSubtitle: 'பில்லிங் கவுண்ட்டரை அணுக உள்நுழையவும்',
    loginHeroEyebrow: 'வேளாண் பில்லிங் சிஸ்டம்',
    loginHeroTitle: 'ஒவ்வொரு வயல் பில்லும், கணக்கில் பதிவு செய்யப்பட்டது',
    loginHeroCaption: 'தமிழ்நாட்டின் விவசாயிகளுக்கு விதை, உரம் மற்றும் வேளாண் உள்ளீட்டுப் பில்களை GST முன்னெச்சரிக்கையுடன் தெர்மல் அச்சித்து வழங்குங்கள்.',
    loginHeroFeatureOffline: 'ஆஃப்லைனில் செயல்படும்',
    loginHeroFeatureGst: 'GST ஏற்பத்து',
    loginHeroFeaturePrint: 'தெர்மல் & A4 அச்சிடுதல்',
    loginImageAlt: 'பசுமையான விவசாய வயலில் பாரம்பரிய மாட்டு ஏர் உழவு மற்றும் நவீன விவசாய இயந்திரங்களுடன் பணிபுரியும் விவசாயிகள்',
    username: 'பயனாளர் பெயர் (Username)',
    usernamePlaceholder: 'உங்கள் பயனாளர் பெயரை உள்ளிடவும்',
    password: 'கடவுச்சொல் (Password)',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    signIn: 'உள்நுழைக (Sign In)',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    forgotPasswordTitle: 'கடவுச்சொல் மீட்டமைப்பு',
    forgotPasswordSubtitle: 'பயனாளர் பெயர் மற்றும் சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்',
    resetPasswordTitle: 'புதிய கடவுச்சொல் அமைத்தல்',
    resetPasswordSubtitle: 'உங்கள் கணக்கிற்கு புதிய வலுவான கடவுச்சொல்லை உள்ளிடவும்',
    verificationCode: 'நிர்வாக சரிபார்ப்புக் குறியீடு',
    verificationCodePlaceholder: 'அட்மின் வழங்கிய குறியீட்டை உள்ளிடவும்',
    newPassword: 'புதிய கடவுச்சொல்',
    newPasswordPlaceholder: 'குறைந்தது 4 எழுத்துக்கள்',
    confirmPassword: 'கடவுச்சொல்லை உறுதி செய்',
    confirmPasswordPlaceholder: 'மீண்டும் கடவுச்சொல்லை உள்ளிடவும்',
    resetPasswordButton: 'கடவுச்சொல்லை மாற்று',
    backToLogin: 'உள்நுழைவுக்குத் திரும்பு',
    createAccountTitle: 'புதிய பயனாளர் பதிவு',
    createAccountSubtitle: 'பில்லிங் பணியாளருக்கான புதிய கணக்கை உருவாக்கவும்',
    fullName: 'முழுப் பெயர்',
    fullNamePlaceholder: 'பணியாளரின் முழுப் பெயரை உள்ளிடவும்',
    phoneNumber: 'கைபேசி எண்',
    phoneNumberPlaceholder: '10 இலக்க செல்போன் எண்',
    adminSecretKey: 'அட்மின் ரகசியக் குறியீடு',
    adminSecretKeyPlaceholder: 'புதிய பயனாளர் உருவாக்க தேவையான ரகசியக் குறியீடு',
    createAccountButton: 'கணக்கை உருவாக்கு',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    registerNow: 'புதிய பயனாளர் பதிவு',
    roleAdmin: 'முதன்மை நிர்வாகி (Admin)',
    roleManager: 'பில்லிங் மேலாளர் (Manager)',
    roleOperator: 'கவுண்டர் ஆபரேட்டர் (Operator)',

    // Dashboard
    todaySales: 'இன்றைய மொத்த விற்பனை',
    todayBills: 'இன்றைய ரசீதுகள் எண்ணிக்கை',
    totalCustomers: 'பதிவுசெய்த விவசாயிகள் / வாடிக்கையாளர்கள்',
    lowStockItems: 'குறைந்த இருப்பு எச்சரிக்கை',
    recentBills: 'சமீபத்திய பில்கள்',
    quickActions: 'விரைவுச் செயல்கள்',
    newBillButton: '+ புதிய பில் (F2)',
    viewHistoryButton: 'பில் வரலாறு',
    viewProductsButton: 'பொருட்கள் மேலாண்மை',
    lowStockAlertTitle: 'சரக்கு இருப்பு எச்சரிக்கை',
    lowStockAlertMsg: 'பின்வரும் பொருட்கள் குறைந்தபட்ச இருப்பு அளவை விட குறைவாக உள்ளன:',
    stockLeft: 'மீதமுள்ள இருப்பு',
    minAlert: 'குறைந்தபட்ச அளவு',
    noRecentBills: 'இன்று இதுவரை பில்கள் எதுவும் போடப்படவில்லை.',
    noLowStock: 'அனைத்து பொருட்களின் இருப்பும் திருப்திகரமாக உள்ளது.',

    // Billing Counter
    customerDetails: 'விவசாயி / வாடிக்கையாளர் விபரம்',
    customerName: 'விவசாயி / வாடிக்கையாளர் பெயர்',
    customerMobile: 'கைபேசி எண்',
    customerAddress: 'ஊர் / முகவரி',
    gstin: 'ஜி.எஸ்.டி எண் (தேவையெனில்)',
    productSelection: 'பொருள் தேர்வு',
    searchProductPlaceholder: 'பொருளின் பெயர், HSN குறியீடு அல்லது வகையை தேடவும்...',
    fixedRate: 'விலை (₹)',
    qty: 'அளவு (Qty)',
    unit: 'அலகு (Unit)',
    gstRate: 'ஜி.எஸ்.டி %',
    amount: 'தொகை (₹)',
    addProduct: '+ பொருள் சேர்க்க',
    increaseQuantity: 'அளவை அதிகரிக்க',
    decreaseQuantity: 'அளவை குறைக்க',
    removeItem: 'பொருளை நீக்க',
    subtotal: 'கூடுதல் தொகை (Subtotal)',
    cgst: 'மத்திய ஜி.எஸ்.டி (CGST)',
    sgst: 'மாநில ஜி.எஸ்.டி (SGST)',
    igst: 'ஒருங்கிணைந்த ஜி.எஸ்.டி (IGST)',
    roundOff: 'சமன் தொகை (Round Off)',
    grandTotal: 'மொத்த தொகை (Grand Total)',
    amountInWords: 'தொகை எழுத்தில்',
    paymentMethod: 'செலுத்தும் முறை',
    amountReceived: 'பெற்ற தொகை (₹)',
    balance: 'மீதி தொகை (₹)',
    clearBill: 'அழி (Clear)',
    printPreview: 'முன்னோட்டம்',
    saveAndPrint: 'சேமித்து அச்சிடு (SAVE & PRINT)',
    saveBill: 'சேமிக்க மட்டும்',
    paymentCash: 'ரொக்கம் (Cash)',
    paymentUpi: 'UPI / Google Pay',
    paymentCard: 'கார்டு (Card)',
    paymentCredit: 'கடன் (Udhari / Credit)',
    billSavedSuccess: 'பில் வெற்றிகரமாக சேமிக்கப்பட்டது!',
    itemAlreadyAdded: 'இப்பொருள் ஏற்கனவே பட்டியலில் உள்ளது. அளவு அதிகரிக்கப்பட்டது.',
    pleaseSelectProduct: 'பொருளைத் தேர்ந்தெடுக்கவும்.',
    enterValidQty: 'சரியான அளவை உள்ளிடவும் (0 விட அதிகம்).',
    gstMode: 'வரி முறை (GST Mode)',
    gstModeCgstSgst: 'CGST + SGST (தமிழ்நாடு உள்ளூர்)',
    gstModeIgst: 'IGST (மாநிலங்களுக்கு இடையே)',
    gstModeExempted: 'வரி விலக்கு (Exempted)',

    // Product Master
    addProductTitle: 'புதிய பொருள் சேர்க்க',
    editProductTitle: 'பொருள் விபரங்களை மாற்ற',
    productName: 'பொருளின் பெயர்',
    productCategory: 'பொருள் வகை',
    hsnCode: 'HSN / SAC குறியீடு',
    sellingPrice: 'விற்பனை விலை (₹)',
    purchasePrice: 'கொள்முதல் விலை (₹)',
    stockQuantity: 'தற்போதைய இருப்பு',
    minStockAlert: 'குறைந்தபட்ச இருப்பு எச்சரிக்கை',
    unitType: 'அளவீட்டு அலகு (Unit)',
    activeStatus: 'விற்பனைக்கு கிடைக்குமா (Active)',
    deleteProductConfirm: 'இப்பொருளை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    productAddedMsg: 'பொருள் வெற்றிகரமாக சேர்க்கப்பட்டது!',
    productUpdatedMsg: 'பொருள் விபரம் மாற்றப்பட்டது!',
    productDeletedMsg: 'பொருள் நீக்கப்பட்டது.',

    // Categories
    catAll: 'அனைத்து வகைகள்',
    catSeeds: 'விதை வகைகள் (Seeds)',
    catFertilizers: 'உரங்கள் (Fertilizers)',
    catPesticides: 'பூச்சிக்கொல்லிகள் (Pesticides)',
    catOrganicManure: 'இயற்கை உரம் (Organic Manure)',
    catAgriTools: 'விவசாயக் கருவிகள்',
    catIrrigation: 'பாசன உபகரணங்கள்',
    catPlantGrowth: 'பயிர் வளர்ச்சி ஊக்கிகள்',
    catCropProtection: 'பயிர் பாதுகாப்பு மருந்துகள்',
    catBioFertilizers: 'நுண்ணுயிர் உரங்கள்',
    catFarmingAccessories: 'விவசாய துணைப் பொருட்கள்',
    catOther: 'பொதுவான பொருட்கள்',

    // Customer Management
    addCustomerTitle: 'புதிய வாடிக்கையாளர் சேர்க்க',
    editCustomerTitle: 'வாடிக்கையாளர் விபரம் மாற்ற',
    totalPurchases: 'மொத்த கொள்முதல்',
    outstandingBalance: 'நிலுவைத் தொகை',
    villageTown: 'ஊர் / கிராமம்',
    customerAddedMsg: 'வாடிக்கையாளர் விபரம் சேமிக்கப்பட்டது!',
    customerUpdatedMsg: 'வாடிக்கையாளர் விபரம் மாற்றப்பட்டது!',
    customerDeletedMsg: 'வாடிக்கையாளர் நீக்கப்பட்டார்.',

    // History & Invoices
    billNumber: 'பில் எண்',
    billDate: 'தேதி',
    invoiceType: 'ரசீது வடிவம்',
    thermalInvoice: 'தெர்மல் பில் (Thermal Slip)',
    a4Invoice: 'A4 / A5 ஜி.எஸ்.டி ரசீது',
    cancelBillConfirm: 'இந்த பில்லை ரத்து செய்ய விரும்புகிறீர்களா? இருப்பு தானாக மீட்டமைக்கப்படும்.',
    billCancelledMsg: 'பில் ரத்து செய்யப்பட்டது.',
    printInvoice: 'பில் அச்சிடு',
    downloadPdf: 'PDF பதிவிறக்கம்',
    billDetails: 'பில் விபரம்',
    itemsList: 'வாங்கிய பொருட்கள்',

    // Reports
    today: 'இன்று',
    thisWeek: 'இந்த வாரம்',
    thisMonth: 'இந்த மாதம்',
    customRange: 'தேதி வரம்பு',
    totalRevenue: 'மொத்த வருவாய்',
    cashSales: 'ரொக்க வசூல்',
    upiSales: 'UPI டிஜிட்டல் வசூல்',
    creditSales: 'கடன் விற்பனை',
    taxCollected: 'மொத்த ஜி.எஸ்.டி வசூல்',
    topSellingProducts: 'அதிகம் விற்ற பொருட்கள்',

    // Backup & Settings
    downloadBackup: 'முழு JSON காப்புப்பிரதி பதிவிறக்கம்',
    restoreBackup: 'JSON கோப்பிலிருந்து மீட்டமை',
    resetDatabase: 'தரவுத்தளத்தை மீட்டமைக்க',
    businessName: 'வணிக / கடை பெயர்',
    tagline: 'முழக்கம் / குறிக்கோளுரை',
    businessAddress: 'கடை முகவரி',
    phone1: 'முதன்மை தொடர்பு எண்',
    phone2: 'கூடுதல் தொடர்பு எண்',
    email: 'மின்னஞ்சல் முகவரி',
    defaultGstMode: 'இயல்புநிலை வரி முறை',
    thermalPaperWidth: 'தெர்மல் பேப்பர் அளவு',
    enableRoundOff: 'சமன் தொகை கணக்கிடுதல் (Round-Off)',
    backupReminderDays: 'காப்புப்பிரதி நினைவூட்டல் (நாட்கள்)',
    settingsSavedMsg: 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!',

    // Audit Logs
    auditAction: 'செய்யப்பட்ட செயல்',
    auditRecord: 'பிரிவு',
    auditDetails: 'விவரம்',
    auditTime: 'நேரம்',

    // Language selector
    languageName: 'தமிழ்',
    switchLanguage: 'மொழியை மாற்று',
  }
};

const supplementalEnglish: Partial<TranslationDictionary> = {
  invalidUsername: 'Invalid username or user does not exist.',
  accountDeactivated: 'This user account is deactivated. Contact the administrator.',
  invalidPassword: 'Invalid password. Please try again.',
  usernameExists: 'A user with this username already exists.',
  usernameRequired: 'Please enter your username.',
  usernameNotFound: 'No account was found for this username.',
  authResetSuccess: 'Password reset successfully. Please sign in with your new password.',
  authTagline: 'Agricultural Products & Farm Inputs',
  authSubtitle: 'Sign in to access the agricultural billing counter',
  authRequired: 'Please fill in the required fields.',
  authMinUsername: 'Username must be at least 3 characters.',
  authMinPassword: 'Password must be at least 4 characters.',
  authPasswordsMismatch: 'Passwords do not match. Please verify.',
  authAdminKeyRequired: 'Admin authorization key is required to register an Administrator.',
  authUnexpected: 'An unexpected error occurred. Please try again.',
  authAccountCreated: 'Account created successfully! You can now sign in.',
  authLoginAgain: 'Already have an account? Sign in',
  authShowPassword: 'Show password',
  authHidePassword: 'Hide password',
  authMobileOptional: 'Mobile number (optional)',
  authPhoneLabel: 'Phone',
  authConfirmLabel: 'Confirm',
  authMinChars: 'Minimum 4 characters',
  authRepeatPassword: 'Repeat password',
  authRecoveryHint: 'Enter the registered shop mobile or master recovery key.',
  authVerificationFailed: 'Verification failed. Enter the registered shop mobile number or master recovery key.',
  authBackToLogin: 'Back to Sign In',
  defaultCredentials: 'Default credentials — Admin: admin / Operator: operator',
  greetingMorning: 'Good Morning',
  greetingAfternoon: 'Good Afternoon',
  greetingEvening: 'Good Evening',
  todayLabel: 'Today',
  revenueToday: 'Revenue Today',
  inclGst: 'including GST',
  uniqueToday: 'unique today',
  itemsNeedRestock: 'items need restock',
  viewAll: 'View all',
  payment: 'Payment',
  recentBills: 'Recent Bills',
  stockAlerts: 'Stock Alerts',
  backupDescription: 'Export and restore all local billing records, customers, products, and sequences.',
  lastBackup: 'Last Backup',
  neverTaken: 'Never taken',
  backupReminderText: 'Your last backup was {days} days ago. Please download a backup to keep your billing safe.',
  backupReminderNever: 'Your last backup was never taken. Please download a backup to keep your billing safe.',
  downloadBackupButton: 'Download Complete Backup',
  generatingBackup: 'Generating Backup…',
  restoreWarningTitle: 'Warning: Restore Application Backup',
  restoreWarningText: 'Restoring this backup may replace existing application data. Verify that you have created a recent backup before continuing.',
  restoreDetails: 'Backup details: Exported at {date} with {bills} bills and {products} products.',
  restoreDatabase: 'Restore Database',
  reminderDescription: 'Set how frequently the system should display a backup reminder on the dashboard header.',
  everyDay: 'Every 1 Day',
  everySevenDays: 'Every 7 Days (Recommended)',
  everyThirtyDays: 'Every 30 Days',
  disabledOption: 'Disabled',
  settingsDescription: 'Configure mandatory invoice header, GST parameters, and default print formats.',
  gstProtected: 'GSTIN & Shop Header Protected',
  settingsRequired: 'Business Name, GSTIN, and Primary Mobile are mandatory.',
  settingsSaveSuccess: 'Settings updated successfully. Changes are reflected on printed bills.',
  settingsViewOnly: 'Settings are view-only for operator accounts. Login as admin to modify.',
  savingSettings: 'Saving Settings…',
  saveSettings: 'Save Settings Changes',
  invoiceThankYou: 'Thank you message displayed on invoices',
  thermalOption: '80mm Thermal Receipt (Counter standard)',
  a4Option: 'A4 Tax Invoice (Full page)',
  usersDescription: 'Manage billing operators and system administrators.',
  addAccount: 'Add Operator / Admin',
  activate: 'Activate',
  deactivate: 'Deactivate',
  savePassword: 'Save Password',
  loginPassword: 'Login password',
  operatorOption: 'Billing Operator (Counter billing only)',
  adminOption: 'System Administrator (Full access, price editing, deletions)',
  auditDescription: 'Immutable security trail for price changes, bill generation, and deletions.',
  totalActions: 'Total Recorded Actions',
  searchAudit: 'Search audit trail by user, action, details, or bill number…',
  noAudit: 'No audit logs matching query.',
  invoiceTitle: 'Tax Invoice',
  invoiceSubtitle: 'Agricultural Products & Farm Inputs',
  invoiceNo: 'Bill No',
  invoiceDate: 'Date',
  invoiceTime: 'Time',
  billedTo: 'Billed To',
  customerMobile: 'Customer Mobile',
  village: 'Village',
  crop: 'Crop',
  landArea: 'Land Area',
  paymentMode: 'Payment Mode',
  received: 'Received',
  balanceDue: 'Balance Due',
  itemNo: 'S.No',
  agriculturalItem: 'Product / Agricultural Item',
  hsnSac: 'HSN/SAC',
  taxPercent: 'Tax %',
  taxableSubtotal: 'Subtotal (Taxable)',
  totalAmount: 'TOTAL AMOUNT',
  amountInWordsLabel: 'Amount in words',
  scanPay: 'Scan & Pay via UPI',
  terms: 'Terms & Conditions',
  invoiceFooter: 'Thank you for your business.',
  passwordRequired: 'Please enter your admin password to proceed.',
  incorrectAdminPassword: 'Incorrect admin password. Action aborted.',
  taxableLabel: 'Taxable',
  centralGst: 'Central GST (CGST)',
  stateGst: 'State GST (SGST)',
  integratedGst: 'Integrated GST (IGST)',
  customerRequired: 'Customer name is mandatory.',
  atLeastOneProduct: 'Please add at least one product to the bill.',
  quantityGreater: 'Quantity for "{name}" must be greater than 0.',
  manualBillRequired: 'Please enter a valid manual bill number or switch to Auto mode.',
  billNumberExists: 'Bill number "{number}" already exists. Please enter a unique bill number.',
  saveBillError: 'Unable to save the bill locally. Check browser storage permissions and try again.',
  itemName: 'Item',
  termsOne: 'Quality seeds and agro-inputs are sold with manufacturer batch verification.',
  termsTwo: 'Goods once sold will not be accepted back without the original tax bill.',
  termsThree: 'Subject to Tiruvannamalai jurisdiction.',
  offlineBillingSystem: 'Offline Billing System',
  billSummary: 'Bill Summary',
  yesterday: 'Yesterday',
  last7Days: 'Last 7 Days',
  allTime: 'All Time',
  summaryBreakdown: 'Summary Breakdown',
  productWiseSales: 'Product-wise Sales',
  customerPurchases: 'Customer Purchases',
  detailedBills: 'Detailed Bills List',
  salesReportsDescription: 'Detailed sales performance, GST collections, and product reports',
  totalBillsGenerated: 'Total Bills Generated',
  cashVsDigital: 'Cash vs Digital',
  gstBreakdown: 'GST Tax Breakdown (Selected Period)',
  paymentBreakdown: 'Payment Method Breakdown',
  noProductSales: 'No product sales recorded in this date range.',
  noCustomerRecords: 'No customer records found for this period.',
  billsIssued: 'Bills Issued in Range',
  billingItems: 'Billing Items',
  fixedPriceLocked: 'Fixed Price Locked',
  noProductsAdded: 'No products added yet',
  productName: 'Product',
  rate: 'Rate',
  deleteColumn: 'Del',
  paymentTaxConfiguration: 'Payment & Tax Configuration',
  intraStateTax: 'Intra-state (CGST + SGST)',
  interStateTax: 'Inter-state (IGST)',
  gstExempt: 'GST Exempt',
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank: 'Bank',
  khata: 'Khata',
  other: 'Other',
  change: 'Change',
  liveTotal: 'Live Total',
  saving: 'Saving…',
  clearShortcut: 'Clear (F2)',
  manualBillNumber: 'Manual',
  resetAuto: 'Reset Auto',
  villageFormat: 'Village',
  standardFormat: 'Standard',
  farmerBuyerProfile: 'Farmer / Buyer Profile',
  farmerName: 'Farmer name',
  mobileNo: 'Mobile No.',
  villageTown: 'Village / Town',
  cropType: 'Crop Type',
  landAreaInput: 'Land Area / Acres',
  gstinOptional: 'GSTIN (Optional)',
  returningCustomers: 'Returning Customers',
  categorySeedsPaddy: 'Seeds & Paddy',
  nativeSeeds: 'Native Seeds',
  organicChemical: 'Organic & Chemical',
  cropProtection: 'Crop Protection',
  toolsEquipment: 'Tools & Equipment',
  agricultureTools: 'Agriculture Tools',
  noCustomers: 'No customers found.',
  customersAutoAdded: 'Customers are automatically added when generating bills.',
  notProvided: 'Not provided',
  totalBills: 'Total Bills',
  totalSpent: 'Total Spent',
  lastVisit: 'Last Visit',
  billNo: 'Bill No',
  items: 'Items',
  amount: 'Amount',
  action: 'Action',
  dateRange: 'Date Range',
  from: 'From',
  to: 'To',
  noBills: 'No bills found.',
  noProducts: 'No products configured.',
  adminAddProducts: 'Admin can add products using the button above.',
  lowStock: 'Low Stock',
  active: 'Active',
  disabled: 'Disabled',
  viewOnly: 'View Only',
  addOperator: 'Add Operator / Admin',
  addNewAccount: 'Add New Account',
  resetPassword: 'Reset Password',
  userAccount: 'User Account',
  resetKey: 'Reset Key',
  selectProduct: 'Select Product',
  noActiveProducts: 'No active products found matching your search.',
  adminCanConfigure: 'Admin can configure products in Product Master.',
  fixedRate: 'Fixed Rate',
  pressEnterSelect: 'Press Enter or click Select',
  billSaved: 'Bill Saved Successfully',
  printBillNow: 'Print Bill Now (80mm / A4)',
  createAnotherBill: 'Create Another Bill (F2)',
  backToBilling: 'Back to Billing',
  traditionalBill: 'Traditional Village Agriculture bill & GST invoice preview',
  pressCtrlP: 'Press Ctrl + P to print',
  a4Standard: 'A4 Standard',
  a5Compact: 'A5 Compact',
  thermal80mm: '80mm Thermal',
  printBill: 'PRINT BILL',
  confirmAdminPassword: 'Confirm with Admin Password',
  processing: 'Processing…',
  dismiss: 'Dismiss',
  backupOverdue: 'Backup Reminder Overdue',
  exportComplete: 'Export Complete Backup',
  exportDescription: 'Download single-file JSON database archive',
  format: 'Format',
  targetFile: 'Target File',
  restoreData: 'Restore Application Data',
  restoreDescription: 'Admin-only restoration from valid JSON backup',
  selectBackupFile: 'Select Backup File to Restore',
  restoreRequiresAuth: 'Restoration requires System Administrator authentication.',
  configurableReminder: 'Configurable Backup Reminder',
  filterRange: 'Filter Range',
  printReport: 'Print Report',
  cashPayments: 'Cash Payments',
  upiTransfers: 'UPI / QR Transfers',
  cardPayments: 'Debit / Credit Card',
  outstanding: 'Credit (Outstanding)',
  productSalesSummary: 'Product Sales Summary',
  customerName: 'Customer Name',
  mobile: 'Mobile',
  billsCount: 'Bills Count',
  totalPurchased: 'Total Purchased',
  quantitySold: 'Quantity Sold',
  taxableSales: 'Taxable Sales',
  gstTax: 'GST Tax',
  totalRevenue: 'Total Revenue',
  businessIdentity: 'Business Identity & Tax Registration',
  officialBusinessName: 'Official Business Name',
  businessTagline: 'Business Tagline',
  gstinNumber: 'GSTIN (GST Number)',
  businessEmail: 'Business Email',
  contactAddress: 'Mobile Numbers & Physical Shop Address',
  primaryMobile: 'Primary Mobile Number',
  buildingFlat: 'Building No./Flat No.',
  roadStreet: 'Road / Street',
  cityTownVillage: 'City / Town / Village',
  district: 'District',
  state: 'State',
  pinCode: 'PIN Code',
  billingDefaults: 'Billing Defaults & Invoice Footers',
  defaultGstCalculation: 'Default GST Calculation Mode',
  defaultPrintOutput: 'Default Print Output',
  invoiceFooterNote: 'Invoice Footer Note',
  dateTime: 'Date & Time',
  details: 'Details',
};

const supplementalTamil: Partial<TranslationDictionary> = {
  invalidUsername: 'பயனாளர் பெயர் தவறாக உள்ளது அல்லது கணக்கு இல்லை.',
  accountDeactivated: 'இந்த பயனாளர் கணக்கு செயலிழக்கப்பட்டுள்ளது. நிர்வாகியை-contact செய்யவும்.',
  invalidPassword: 'கடவுச்சொல் தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.',
  usernameExists: 'இந்தப் பயனாளர் பெயர் ஏற்கனவே பயன்படுத்தப்பட்டுள்ளது.',
  usernameRequired: 'பயனாளர் பெயரை உள்ளிடவும்.',
  usernameNotFound: 'இந்தப் பெயருக்கான கணக்கு கிடைக்கவில்லை.',
  authResetSuccess: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. புதிய கடவுச்சொல்லால் உள்நுழையவும்.',
  authTagline: 'விவசாய பொருட்கள் மற்றும் பயிர் உள்ளீடுகள்',
  authSubtitle: 'விவசாய பில்லிங் கவுண்ட்டரை அணுக உள்நுழையவும்',
  authRequired: 'தேவையான புலங்களை நிரப்பவும்.',
  authMinUsername: 'பயனாளர் பெயர் குறைந்தது 3 எழுத்துக்கள் இருக்க வேண்டும்.',
  authMinPassword: 'கடவுச்சொல் குறைந்தது 4 எழுத்துக்கள் இருக்க வேண்டும்.',
  authPasswordsMismatch: 'கடவுச்சொல்கள் ஒன்றுடன் ஒன்று பொருந்தவில்லை.',
  authAdminKeyRequired: 'நிர்வாகியைப் பதிவு செய்ய அட்மின் அங்கீகாரக் குறியீடு தேவை.',
  authUnexpected: 'எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
  authAccountCreated: 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! இப்போது உள்நுழையலாம்.',
  authLoginAgain: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',
  authShowPassword: 'கடவுச்சொல்லைக் காட்டு',
  authHidePassword: 'கடவுச்சொல்லை மறைக்க',
  authMobileOptional: 'கைபேசி எண் (தேவையெனில்)',
  authPhoneLabel: 'கைபேசி',
  authConfirmLabel: 'உறுதி செய்',
  authMinChars: 'குறைந்தது 4 எழுத்துக்கள்',
  authRepeatPassword: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
  authRecoveryHint: 'பதிவுசெய்த கடை எண் அல்லது மூல மீட்புக் குறியீட்டை உள்ளிடவும்.',
  authVerificationFailed: 'சரிபார்ப்பு தோல்ந்தது. பதிவுசெய்த கடை மொபைல் எண் அல்லது மூல மீட்புக் குறியீட்டை உள்ளிடவும்.',
  authBackToLogin: 'உள்நுழைவுக்குத் திரும்பு',
  defaultCredentials: 'இயல்பான விவரங்கள் — நிர்வாகி: admin / ஆபரேட்டர்: operator',
  greetingMorning: 'காலை வணக்கம்',
  greetingAfternoon: 'மதிய வணக்கம்',
  greetingEvening: 'மாலை வணக்கம்',
  todayLabel: 'இன்று',
  revenueToday: 'இன்றைய வருவாய்',
  inclGst: 'GST உட்பட',
  uniqueToday: 'இன்று தனித்தவர்கள்',
  itemsNeedRestock: 'மீளச் சேர்க்க வேண்டிய பொருட்கள்',
  viewAll: 'அனைத்தையும் பார்',
  payment: 'செலுத்துதல்',
  recentBills: 'சமீபத்திய பில்கள்',
  stockAlerts: 'இருப்பு எச்சரிக்கைகள்',
  backupDescription: 'உள்ளூர் பில்லிங் பதிவுகள், வாடிக்கையாளர்கள், பொருட்கள் மற்றும் வரிசை எண்களை ஏற்றுமதி / மீட்டமைக்கவும்.',
  lastBackup: 'கடைசி காப்பு',
  neverTaken: 'எப்போதும் எடுக்கப்படவில்லை',
  backupReminderText: 'கடைசி காப்பு {days} நாட்களுக்கு முன்பு எடுக்கப்பட்டது. பில்லிங் பாதுகாப்புக்கு காப்பு பதிவிறக்கவும்.',
  backupReminderNever: 'காப்பு இதுவரை எடுக்கப்படவில்லை. பில்லிங் பாதுகாப்புக்கு காப்பு பதிவிறக்கவும்.',
  downloadBackupButton: 'முழு காப்பைப் பதிவிறக்கு',
  generatingBackup: 'காப்பு உருவாக்குகிறது…',
  restoreWarningTitle: 'எச்சரிக்கை: பயன்பாட்டுக் காப்பை மீட்டமை',
  restoreWarningText: 'இந்தக் காப்பை மீட்டமைப்பது இருப்பிலுள்ள தரவை மாற்றும். தொடர்பதற்கு சமீபத்திய காப்பு உருவாக்கியுள்ளதா என்பதை உறுதிசெய்யவும்.',
  restoreDetails: 'காப்பு விவரம்: {date} நாளில் ஏற்றுமதி செய்யப்பட்டது; {bills} பில்கள், {products} பொருட்கள்.',
  restoreDatabase: 'தரவுத்தளத்தை மீட்டமை',
  reminderDescription: 'தலைப்புப் பகுதியில் காப்பு நினைவூட்டல் எத்தனை நாட்களுக்கு இடையே காட்டப்பட வேண்டும் என்பதை அமைக்கவும்.',
  everyDay: 'ஒவ்வொரு 1 நாளும்',
  everySevenDays: 'ஒவ்வொரு 7 நாட்களும் (பரிந்துரை)',
  everyThirtyDays: 'ஒவ்வொரு 30 நாட்களும்',
  disabledOption: 'செயலிழக்கப்பட்டது',
  settingsDescription: 'கட்டாய இன்வோய்ஸ் தலைப்பு, GST அமைப்புகள் மற்றும் இயல்பான அச்சு வடிவங்களை அமைக்கவும்.',
  gstProtected: 'GSTIN மற்றும் கடைத் தலைப்பு பாதுகாக்கப்பட்டது',
  settingsRequired: 'வணிக பெயர், GSTIN மற்றும் முதன்மை கைபேசி கட்டாயம்.',
  settingsSaveSuccess: 'அமைப்புகள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன. அச்சிக்கும் பில்களில் மாற்றங்கள் பிரதிப்படும்.',
  settingsViewOnly: 'ஆபரேட்டர் கணக்குகளுக்கு அமைப்புகள் பார்வை மட்டும். மாற்ற நிர்வாகியாக உள்நுழையவும்.',
  savingSettings: 'அமைப்புகளைச் சேமிக்கிறது…',
  saveSettings: 'அமைப்பு மாற்றங்களைச் சேமி',
  invoiceThankYou: 'ரசீதுகளில் காட்டப்படும் நன்றி செய்தி',
  thermalOption: '80mm தெர்மல் ரசீது (கவுண்டர் தரந்தரப்பு)',
  a4Option: 'A4 ரசீது (முழு பக்கம்)',
  usersDescription: 'பில்லிங் ஆபரேட்டர்கள் மற்றும் நிர்வாகிகளை நிர்வாகிக்கவும்.',
  addAccount: 'ஆபரேட்டர் / நிர்வாகியைச் சேர்',
  activate: 'செயலில் செய்',
  deactivate: 'செயலிழக்கு',
  savePassword: 'கடவுச்சொல்லைச் சேமி',
  loginPassword: 'உள்நுழைவுக் கடவுச்சொல்',
  operatorOption: 'பில்லிங் ஆபரேட்டர் (கவுண்டர் பில்லிங் மட்டும்)',
  adminOption: 'நிர்வாகி (முழு அணுகல், விலை திருத்தம், நீக்கங்கள்)',
  auditDescription: 'விலை மாற்றங்கள், பில்கள் உருவாக்கம் மற்றும் நீக்கங்களுக்கான மாற்ற முடியாத பாதுகாப்புப் பதிவு.',
  totalActions: 'மொத்த பதிவான செயல்கள்',
  searchAudit: 'பயனாளர், செயல், விவரம் அல்லது பில் எண் மூலம் தேடுங்கள்…',
  noAudit: 'தேடலுக்கு பொருந்தும் பதிவுகள் இல்லை.',
  invoiceTitle: 'வரி ரசீது',
  invoiceSubtitle: 'விவசாய பொருட்கள் & பயிர் உள்ளீடுகள்',
  invoiceNo: 'பில் எண்',
  invoiceDate: 'தேதி',
  invoiceTime: 'நேரம்',
  billedTo: 'விலங்கு வரி செலுத்துபவர்',
  customerMobile: 'வாடிக்கையாளர் கைபேசி',
  village: 'ஊர்',
  crop: 'பயிர்',
  landArea: 'நிலபரப்பு',
  paymentMode: 'செலுத்தும் முறை',
  received: 'பெற்ற தொகை',
  balanceDue: 'நிலுவைத் தொகை',
  itemNo: 'வரிசை எண்',
  agriculturalItem: 'பொருள் / விவசாயப் பொருட்கள்',
  hsnSac: 'HSN/SAC',
  taxPercent: 'வரி %',
  taxableSubtotal: 'கூடுதல் தொகை (வரி விதிக்கப்பட்டது)',
  totalAmount: 'மொத்தத் தொகை',
  amountInWordsLabel: 'தொகை எழுத்தில்',
  scanPay: 'UPI மூலம் ஸ்கேன் செய்து செலுத்தவும்',
  terms: 'விதிமுறைகள்',
  invoiceFooter: 'உங்கள் வருக்கிறதற்கு நன்றி.',
  passwordRequired: 'தொடர நிர்வாகிக் கடவுச்சொல்லை உள்ளிடவும்.',
  incorrectAdminPassword: 'நிர்வாகிக் கடவுச்சொல் தவறாக உள்ளது. செயல் நிறுத்தப்பட்டது.',
  taxableLabel: 'வரி விதிக்கப்பட்டது',
  centralGst: 'மத்திய GST (CGST)',
  stateGst: 'மாநில GST (SGST)',
  integratedGst: 'ஒருங்கிணைந்த GST (IGST)',
  customerRequired: 'வாடிக்கையாளர் பெயர் கட்டாயம்.',
  atLeastOneProduct: 'பில்லுக்கு குறைந்தது ஒரு பொருளைச் சேர்க்கவும்.',
  quantityGreater: '“{name}” அளவு பூஜ்யத்தை விட அதிகமாக இருக்க வேண்டும்.',
  manualBillRequired: 'சரியான கைமுறை பில் எண்ணை உள்ளிடவும் அல்லது தானியங்கு முறைக்கு மாறவும்.',
  billNumberExists: '“{number}” பில் எண் ஏற்கனவே உள்ளது. தனித்திய பைல் எண்ணை உள்ளிடவும்.',
  saveBillError: 'பில்லை உள்ளூர்ப்பமாகச் சேமிக்க முடியவில்லை. உலாவி சேமிப்பு அனுமதிகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  itemName: 'பொருள்',
  termsOne: 'தரமான விதைகள் மற்றும் வேளாண் உள்ளீடுகள் உற்பத்தியாளர் தேதி சரிபார்ப்புடன் விற்கப்படுகின்றன.',
  termsTwo: 'அசல் வரி ரசீது இல்லாமல் விற்கப்பட்ட பொருட்களை மீண்டும் ஏற்க முடியாது.',
  termsThree: 'திருவண்ணாமலை ஆட்சித்திட்டத்திற்கு உட்பட்டது.',
  offlineBillingSystem: 'ஆஃப்லைன் பில்லிங் சிஸ்டம்',
  billSummary: 'பில் சுருக்கம்',
  yesterday: 'நேற்று',
  last7Days: 'கடந்த 7 நாட்கள்',
  allTime: 'அனைத்து காலம்',
  summaryBreakdown: 'சுருக்கம்',
  productWiseSales: 'பொருள் வாரியாக விற்பனை',
  customerPurchases: 'வாடிக்கையாளர் கொள்முதல்',
  detailedBills: 'விவரமான பில்கள்',
  salesReportsDescription: 'விற்பனை செயல்திறன், GST வசூல் மற்றும் பொருள் அறிக்கைகள்',
  totalBillsGenerated: 'மொத்த உருவான பில்கள்',
  cashVsDigital: 'ரொக்கம் vs டிஜிட்டல்',
  gstBreakdown: 'GST வரி விவரம் (தேர்ந்தெடுக்கப்பட்ட காலம்)',
  paymentBreakdown: 'செலுத்தும் முறை விவரம்',
  noProductSales: 'இந்தத் தேதி வரம்பில் பொருள் விற்பனை இல்லை.',
  noCustomerRecords: 'இந்தக் காலத்தில் வாடிக்கையாளர் பதிவுகள் இல்லை.',
  billsIssued: 'காலத்தில் வழங்கிய பில்கள்',
  billingItems: 'பில்லிங் பொருட்கள்',
  fixedPriceLocked: 'நிலையான விலை பூட்டப்பட்டது',
  noProductsAdded: 'இன்னும் பொருட்கள் சேர்க்கப்படவில்லை',
  productName: 'பொருள்',
  rate: 'விலை',
  deleteColumn: 'நீக்கு',
  paymentTaxConfiguration: 'செலுத்துதல் மற்றும் வரி அமைப்பு',
  intraStateTax: 'உள்ளூர் (CGST + SGST)',
  interStateTax: 'மாநிலங்களுக்கு இடையே (IGST)',
  gstExempt: 'GST விலக்கு',
  cash: 'ரொக்கம்',
  upi: 'UPI',
  card: 'கார்டு',
  bank: 'வங்கி',
  khata: 'கடன்',
  other: 'இதர',
  change: 'மாற்றம்',
  liveTotal: 'நேரடி மொத்தம்',
  saving: 'சேமிக்கிறது…',
  clearShortcut: 'அழி (F2)',
  manualBillNumber: 'கைமுறை எண்',
  resetAuto: 'தானியங்குவிட்டு மீட்டமை',
  villageFormat: 'கிராமம்',
  standardFormat: 'வழக்கமானது',
  farmerBuyerProfile: 'விவசாயி / வாங்குபவர் விவரம்',
  farmerName: 'விவசாயி பெயர்',
  mobileNo: 'கைபேசி எண்',
  villageTown: 'ஊர் / பட்டி',
  cropType: 'பயிர் வகை',
  landAreaInput: 'நிலபரப்பு / ஏக்கரை',
  gstinOptional: 'GSTIN (தேவையெனில்)',
  returningCustomers: 'மீண்டும் வரும் வாடிக்கையாளர்கள்',
  categorySeedsPaddy: 'விதைகள் & நெல்',
  nativeSeeds: 'உள்நாட்டு விதைகள்',
  organicChemical: 'இயற்கை மற்றும் இரசாயனம்',
  cropProtection: 'பயிர் பாதுகாப்பு',
  toolsEquipment: 'கருவிகள் மற்றும் உபகரணங்கள்',
  agricultureTools: 'விவசாயக் கருவிகள்',
  noCustomers: 'வாடிக்கையாளர்கள் எதுவும் இல்லை.',
  customersAutoAdded: 'பில்களை உருவாக்கும்போது வாடிக்கையாளர்கள் தானியங்குவமாக சேர்க்கப்படுகிறார்கள்.',
  notProvided: 'வழங்கப்படவில்லை',
  totalBills: 'மொத்த பில்கள்',
  totalSpent: 'மொத்த செலவு',
  lastVisit: 'கடைசி வருகை',
  billNo: 'பில் எண்',
  items: 'பொருட்கள்',
  amount: 'தொகை',
  action: 'செயல்',
  dateRange: 'தேதி வரம்பு',
  from: 'முதல்',
  to: 'கடைசி',
  noBills: 'பில்கள் எதுவும் கிடைக்கவில்லை.',
  noProducts: 'பொருட்கள் இதுவரை சேர்க்கப்படவில்லை.',
  adminAddProducts: 'நிர்வாகி மேலே உள்ள பொத்தானைப் பயன்படுத்தி பொருட்களைச் சேர்க்கலாம்.',
  lowStock: 'குறைந்த இருப்பு',
  active: 'செயலில்',
  disabled: 'செயலிழக்கப்பட்டது',
  viewOnly: 'பார்வை மட்டும்',
  addOperator: 'ஆபரேட்டர் / நிர்வாகியைச் சேர்',
  addNewAccount: 'புதிய கணக்கைச் சேர்',
  resetPassword: 'கடவுச்சொல்லை மாற்று',
  userAccount: 'பயனாளர் கணக்கு',
  resetKey: 'குறியீட்டை மாற்று',
  selectProduct: 'பொருளைத் தேர்ந்தெடு',
  noActiveProducts: 'தேடலுக்கு பொருந்தும் செயலில் உள்ள பொருட்கள் இல்லை.',
  adminCanConfigure: 'நிர்வாகி பொருட்கள் பட்டியலில் அமைக்கலாம்.',
  fixedRate: 'நிலையான விலை',
  pressEnterSelect: 'Enter அழுத்தினால் அல்லது தேர்ந்தெடுக்கவும்',
  billSaved: 'பில் வெற்றிகரமாகச் சேமிக்கப்பட்டது',
  printBillNow: 'இப்போது பில்லை அச்சிடு (80mm / A4)',
  createAnotherBill: 'மற்றொரு பில்லை உருவாக்கு (F2)',
  backToBilling: 'பில்லிங்கிற்குத் திரும்பு',
  traditionalBill: 'கிராமக் கட்டட விவசாய பில்லும் GST ரசீது முன்னோட்டம்',
  pressCtrlP: 'அச்சிப்பதற்கு Ctrl + P அழுத்தவும்',
  a4Standard: 'A4 வழக்கம்',
  a5Compact: 'A5 சுருக்கமானது',
  thermal80mm: '80mm தெர்மல்',
  printBill: 'பில்லை அச்சிடு',
  confirmAdminPassword: 'நிர்வாகிக் கடவுச்சொல்லால் உறுதிப்படுத்து',
  processing: 'செயலாக்குகிறது…',
  dismiss: 'மூடு',
  backupOverdue: 'காப்புப்பிரதி நினைவூட்டல் தாமதமாக உள்ளது',
  exportComplete: 'முழு காப்புப்பிரதியை ஏற்றுமதி செய்',
  exportDescription: 'ஒற்றை JSON தரவுக் காப்புக் கோப்பைப் பதிவிறக்கு',
  format: 'வடிவம்',
  targetFile: 'குறிக்கப்பட்ட கோப்பு',
  restoreData: 'பயன்பாட்டுத் தரவை மீட்டமை',
  restoreDescription: 'சரியான JSON காப்பிலிருந்து நிர்வாகி மட்டுமே மீட்டமை',
  selectBackupFile: 'காப்புக் கோப்பைத் தேர்ந்தெடு',
  restoreRequiresAuth: 'மீட்டமைக்க நிர்வாகி அங்கீகாரம் தேவை.',
  configurableReminder: 'அமைக்கக்கூடிய காப்பு நினைவூட்டல்',
  filterRange: 'வடிகட்டு வரம்பு',
  printReport: 'அறிக்கையை அச்சிடு',
  cashPayments: 'ரொக்கச் செலுத்துதல்',
  upiTransfers: 'UPI / QR பரிமாற்றம்',
  cardPayments: 'பற்று / கடன் அட்டை',
  outstanding: 'நிலுவை (கடன்)',
  productSalesSummary: 'பொருள் விற்பனை சுருக்கம்',
  customerName: 'வாடிக்கையாளர் பெயர்',
  mobile: 'கைபேசி',
  billsCount: 'பில்களின் எண்ணிக்கை',
  totalPurchased: 'மொத்த கொள்முதல்',
  quantitySold: 'விற்கப்பட்ட அளவு',
  taxableSales: 'வரி விதிக்கப்பட்ட விற்பனை',
  gstTax: 'GST வரி',
  totalRevenue: 'மொத்த வருவாய்',
  businessIdentity: 'வணிக அடையாளம் மற்றும் வரி பதிவு',
  officialBusinessName: 'அதிகாரப்பூர்வ வணிக பெயர்',
  businessTagline: 'வணிக முழக்கம்',
  gstinNumber: 'GSTIN (GST எண்)',
  businessEmail: 'வணிக மின்னஞ்சல்',
  contactAddress: 'கைபேசி எண்கள் மற்றும் கடை முகவரி',
  primaryMobile: 'முதன்மை கைபேசி எண்',
  buildingFlat: 'கட்டிடம் எண் / குடியிருப்பு எண்',
  roadStreet: 'தெரு / சாலை',
  cityTownVillage: 'நகரம் / பட்டி / கிராமம்',
  district: 'மாவட்டம்',
  state: 'மாநிலம்',
  pinCode: 'PIN குறியீடு',
  billingDefaults: 'பில்லிங் இயல்புகள் மற்றும் ரசீது அடிப்படை',
  defaultGstCalculation: 'இயல்பான GST கணக்கீட்டு முறை',
  defaultPrintOutput: 'இயல்பான அச்சு வடிவம்',
  invoiceFooterNote: 'ரசீது குறிப்பு',
  dateTime: 'தேதி மற்றும் நேரம்',
  details: 'விவரங்கள்',
};

export const translations: Record<'en' | 'ta', TranslationDictionary> = {
  en: { ...baseTranslations.en, ...supplementalEnglish } as TranslationDictionary,
  ta: { ...baseTranslations.ta, ...supplementalTamil } as TranslationDictionary,
};
