export const fieldSections = [
  {
    id: "identity",
    title: "Applicant Identity",
    subtitle: "Baseline demographic and employment profile.",
  },
  {
    id: "financial",
    title: "Financial Strength",
    subtitle: "Liquidity and repayment resilience indicators.",
  },
  {
    id: "loan",
    title: "Loan Request",
    subtitle: "Requested exposure, duration, and lending purpose.",
  },
];

export const featureFields = [
  {
    name: "age",
    section: "identity",
    label: "Age",
    description: "Applicant age in completed years.",
    control: "number",
    min: 18,
    max: 100,
    step: 1,
    placeholder: "35",
  },
  {
    name: "sex",
    section: "identity",
    label: "Gender",
    description: "Encoding from training schema.",
    control: "select",
    options: [
      { value: "0", label: "Female" },
      { value: "1", label: "Male" },
    ],
  },
  {
    name: "job",
    section: "identity",
    label: "Job Level",
    description: "Income stability proxy in the model.",
    control: "select",
    options: [
      { value: "0", label: "Unskilled (non-resident)" },
      { value: "1", label: "Unskilled (resident)" },
      { value: "2", label: "Skilled" },
      { value: "3", label: "Highly skilled / management" },
    ],
  },
  {
    name: "housing",
    section: "financial",
    label: "Housing Status",
    description: "Home ownership and monthly burden context.",
    control: "select",
    options: [
      { value: "0", label: "Own" },
      { value: "1", label: "Rent" },
      { value: "2", label: "Free accommodation" },
    ],
  },
  {
    name: "saving",
    section: "financial",
    label: "Savings Band",
    description: "Savings account category from source dataset.",
    control: "select",
    options: [
      { value: "0", label: "Unknown / no account" },
      { value: "1", label: "Low" },
      { value: "2", label: "Moderate" },
      { value: "3", label: "High" },
    ],
  },
  {
    name: "checking",
    section: "financial",
    label: "Checking Band",
    description: "Checking account liquidity indicator.",
    control: "select",
    options: [
      { value: "0", label: "Unknown / no account" },
      { value: "1", label: "Low" },
      { value: "2", label: "Moderate" },
      { value: "3", label: "High" },
    ],
  },
  {
    name: "other",
    section: "financial",
    label: "Other Commitments Flag",
    description: "Additional obligations/support (0 or 1).",
    control: "select",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  {
    name: "credit",
    section: "loan",
    label: "Credit Amount",
    description: "Requested principal amount in USD equivalent.",
    control: "number",
    min: 0,
    max: 50000,
    step: 100,
    placeholder: "12000",
  },
  {
    name: "duration",
    section: "loan",
    label: "Duration (Months)",
    description: "Requested repayment tenure.",
    control: "number",
    min: 1,
    max: 60,
    step: 1,
    placeholder: "24",
  },
  {
    name: "purpose",
    section: "loan",
    label: "Purpose Code",
    description: "Encoded loan use case from the dataset.",
    control: "select",
    options: [
      { value: "0", label: "Car / transport" },
      { value: "1", label: "Education" },
      { value: "2", label: "Furniture / equipment" },
      { value: "3", label: "Business" },
      { value: "4", label: "Personal / other" },
    ],
  },
];

export const sampleApplicantProfile = {
  age: "36",
  sex: "1",
  job: "2",
  housing: "0",
  saving: "2",
  checking: "2",
  other: "0",
  credit: "12000",
  duration: "24",
  purpose: "0",
};

export const initializeFormData = () =>
  featureFields.reduce((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});
