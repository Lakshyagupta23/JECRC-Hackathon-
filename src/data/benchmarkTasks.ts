import { CanonicalTask } from '../types/canonical';

export const BENCHMARK_TASKS: CanonicalTask[] = [
  // --- DOMAIN 1: MATH & REASONING (Numeric Tolerances & Exact Formulations) ---
  {
    task_id: "math_001",
    task_type: "math",
    input: {
      prompt: "A projectile is launched from ground level at an angle of 45 degrees with an initial velocity of 28 m/s. Assuming gravitational acceleration g = 9.8 m/s^2 and neglecting air resistance, calculate the total horizontal range in meters."
    },
    reference: {
      answer: "80.0",
      numeric_value: 80.0,
      unit: "meters",
      acceptable_alternatives: ["80", "80 meters", "80m"]
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_range_formula",
          name: "Correct Physics Formula",
          description: "Uses R = (v^2 * sin(2*theta)) / g",
          weight: 40,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_range_tolerance",
          name: "Numeric Value within Tolerance",
          description: "Absolute difference |actual - 80.0| <= 0.2",
          weight: 60,
          scoring_type: "deterministic_tolerance",
          tolerance: 0.2,
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "medium",
      language: "en",
      tags: ["physics", "kinematics", "projectile"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "math_002",
    task_type: "math",
    input: {
      prompt: "Calculate the compound interest on a principal of $10,000 invested at an annual interest rate of 6% compounded quarterly for 3 years. Round to two decimal places."
    },
    reference: {
      answer: "1956.18",
      numeric_value: 1956.18,
      unit: "dollars",
      acceptable_alternatives: ["$1956.18", "1956.18 dollars"]
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_ci_formula",
          name: "Compound Interest Method",
          description: "Correctly identifies quarterly compounding n=4 and subtracts principal: A - P",
          weight: 40,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_ci_val",
          name: "Numeric Precision",
          description: "Value matches within $0.05 tolerance",
          weight: 60,
          scoring_type: "deterministic_tolerance",
          tolerance: 0.05,
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "medium",
      language: "en",
      tags: ["finance", "compound-interest"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "math_003",
    task_type: "math",
    input: {
      prompt: "Compute the determinant of the 3x3 matrix: [[3, 2, -1], [0, 4, 5], [-2, 1, 4]]."
    },
    reference: {
      answer: "67",
      numeric_value: 67,
      unit: "scalar"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_det_exact",
          name: "Exact Determinant Value",
          description: "Must equal exactly 67",
          weight: 70,
          scoring_type: "deterministic_exact",
          is_critical: true
        },
        {
          criterion_id: "crit_det_steps",
          name: "Expansion Steps Explanation",
          description: "Clear cofactor expansion along row 1 or column 1",
          weight: 30,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "hard",
      language: "en",
      tags: ["linear-algebra", "matrices"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "math_004",
    task_type: "math",
    input: {
      prompt: "What is the probability of rolling a sum of at least 10 with two standard six-sided dice? Express your answer as a simplified fraction."
    },
    reference: {
      answer: "1/6",
      acceptable_alternatives: ["6/36", "0.1667"]
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_dice_combinations",
          name: "Enumeration of Outcomes",
          description: "Correctly identifies (4,6),(5,5),(5,6),(6,4),(6,5),(6,6)",
          weight: 40,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_dice_exact",
          name: "Exact Final Fraction",
          description: "Must reduce to 1/6",
          weight: 60,
          scoring_type: "deterministic_exact",
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "easy",
      language: "en",
      tags: ["probability", "combinatorics"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "math_005",
    task_type: "math",
    input: {
      prompt: "Solve the differential equation dy/dx + 2y = 4 with initial condition y(0) = 5. Provide the exact explicit expression for y(x)."
    },
    reference: {
      answer: "y(x) = 2 + 3*e^(-2*x)",
      acceptable_alternatives: ["y = 2 + 3e^(-2x)", "2 + 3*exp(-2*x)"]
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_ode_method",
          name: "Integrating Factor Method",
          description: "Identifies integrating factor I(x) = e^(2x)",
          weight: 50,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_ode_initial",
          name: "Initial Condition Validation",
          description: "Correctly applies y(0) = 5 yielding constant C = 3",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "2\\s*\\+\\s*3\\s*\\*?\\s*e\\^\\(-2\\s*\\*?\\s*x\\)",
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "hard",
      language: "en",
      tags: ["calculus", "differential-equations"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },

  // --- DOMAIN 2: PYTHON & CODING (Syntax, Edge Cases & Complexity) ---
  {
    task_id: "code_001",
    task_type: "code",
    input: {
      prompt: "Implement a python function `max_subarray_sum(nums: list[int]) -> int` using Kadane's algorithm that runs in O(n) time and O(1) space. It should handle negative numbers."
    },
    reference: {
      answer: "def max_subarray_sum(nums: list[int]) -> int:\n    if not nums:\n        return 0\n    max_so_far = max_ending_here = nums[0]\n    for x in nums[1:]:\n        max_ending_here = max(x, max_ending_here + x)\n        max_so_far = max(max_so_far, max_ending_here)\n    return max_so_far"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_kadane_complexity",
          name: "Time and Space Complexity",
          description: "Single loop pass, strictly O(n) time and O(1) auxiliary space",
          weight: 40,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_kadane_signature",
          name: "Function Signature and Type Hints",
          description: "Contains def max_subarray_sum(nums: list[int]) -> int",
          weight: 20,
          scoring_type: "deterministic_regex",
          regex_pattern: "def max_subarray_sum\\("
        },
        {
          criterion_id: "crit_kadane_all_neg",
          name: "All-Negative Input Handling",
          description: "Does not return 0 when all elements are negative (e.g. [-3, -1, -2] returns -1)",
          weight: 40,
          scoring_type: "llm_judge",
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Python & Coding",
      difficulty: "medium",
      language: "python",
      tags: ["algorithms", "arrays", "dynamic-programming"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "code_002",
    task_type: "code",
    input: {
      prompt: "Write a thread-safe Python singleton decorator `singleton` that can be applied to any class. Ensure it locks on instance creation."
    },
    reference: {
      answer: "import threading\nfrom functools import wraps\n\ndef singleton(cls):\n    instances = {}\n    lock = threading.Lock()\n    @wraps(cls)\n    def get_instance(*args, **kwargs):\n        with lock:\n            if cls not in instances:\n                instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return get_instance"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_thread_safety",
          name: "Thread Lock Implementation",
          description: "Uses threading.Lock() to guard instance instantiation",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "(threading\\.Lock|with\\s+.*lock)"
        },
        {
          criterion_id: "crit_decorator_preservation",
          name: "Decorator Semantics & Wraps",
          description: "Proper closure over instances dict and passes args/kwargs",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Python & Coding",
      difficulty: "hard",
      language: "python",
      tags: ["concurrency", "design-patterns", "decorators"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "code_003",
    task_type: "code",
    input: {
      prompt: "Write a python function `is_valid_bst(root)` that verifies whether a binary tree is a valid Binary Search Tree. Nodes have `.val`, `.left`, and `.right`."
    },
    reference: {
      answer: "def is_valid_bst(root, low=float('-inf'), high=float('inf')):\n    if not root:\n        return True\n    if not (low < root.val < high):\n        return False\n    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_bst_boundary",
          name: "Boundary Propagation (Low/High)",
          description: "Validates that all descendants satisfy BST property, not just immediate children",
          weight: 60,
          scoring_type: "llm_judge",
          is_critical: true
        },
        {
          criterion_id: "crit_bst_base_case",
          name: "Base Case Correctness",
          description: "Returns True for empty root",
          weight: 40,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Python & Coding",
      difficulty: "medium",
      language: "python",
      tags: ["trees", "recursion", "bst"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "code_004",
    task_type: "code",
    input: {
      prompt: "Implement an in-place algorithm in Python to rotate an N x N 2D matrix clockwise by 90 degrees."
    },
    reference: {
      answer: "def rotate(matrix: list[list[int]]) -> None:\n    n = len(matrix)\n    # Transpose\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    # Reverse rows\n    for row in matrix:\n        row.reverse()"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_matrix_inplace",
          name: "In-Place Modification",
          description: "Does not allocate a new matrix; space complexity O(1)",
          weight: 50,
          scoring_type: "llm_judge",
          is_critical: true
        },
        {
          criterion_id: "crit_transpose_reverse",
          name: "Transpose and Reverse Logic",
          description: "Correctly implements transpose then horizontal reflection",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Python & Coding",
      difficulty: "medium",
      language: "python",
      tags: ["arrays", "matrix", "geometry"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "code_005",
    task_type: "code",
    input: {
      prompt: "Write a Python async function `fetch_with_retry(fetch_fn, max_retries=3, backoff_factor=1.5)` that catches exceptions, applies exponential backoff, and re-raises the final error if retries are exhausted."
    },
    reference: {
      answer: "import asyncio\n\nasync def fetch_with_retry(fetch_fn, max_retries=3, backoff_factor=1.5):\n    delay = 1.0\n    for attempt in range(max_retries):\n        try:\n            return await fetch_fn()\n        except Exception as e:\n            if attempt == max_retries - 1:\n                raise e\n            await asyncio.sleep(delay)\n            delay *= backoff_factor"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_asyncio_sleep",
          name: "Non-blocking Async Sleep",
          description: "Uses await asyncio.sleep(), not time.sleep()",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "await\\s+asyncio\\.sleep",
          is_critical: true
        },
        {
          criterion_id: "crit_exp_backoff",
          name: "Exponential Delay Scaling",
          description: "Delay increases exponentially by backoff_factor on each failure",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Python & Coding",
      difficulty: "hard",
      language: "python",
      tags: ["asyncio", "networking", "resilience"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },

  // --- DOMAIN 3: BIOMEDICAL & SCIENTIFIC QA (Factual Rigor & Mechanism Explanations) ---
  {
    task_id: "bio_001",
    task_type: "qa",
    input: {
      prompt: "What is the biochemical role of the protospacer adjacent motif (PAM) in CRISPR-Cas9 genome editing, and what is the canonical PAM sequence for Streptococcus pyogenes Cas9 (SpCas9)?"
    },
    reference: {
      answer: "The PAM (Protospacer Adjacent Motif) serves as an essential recognition signal required for Cas9 binding and cleavage, preventing the bacterial CRISPR locus itself from being cleaved (self vs non-self discrimination). For SpCas9, the canonical PAM sequence is 5'-NGG-3' located directly downstream of the target DNA sequence."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_pam_sequence",
          name: "Exact SpCas9 PAM Sequence",
          description: "Explicitly states 5'-NGG-3' or NGG",
          weight: 40,
          scoring_type: "deterministic_regex",
          regex_pattern: "\\bNGG\\b",
          is_critical: true
        },
        {
          criterion_id: "crit_pam_function",
          name: "Self vs Non-Self Discrimination",
          description: "Explains prevention of self-cleavage and requirement for initial strand unwinding",
          weight: 60,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "medium",
      language: "en",
      tags: ["genetics", "crispr", "molecular-biology"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "bio_002",
    task_type: "qa",
    input: {
      prompt: "Explain why concurrent administration of a non-selective MAO inhibitor (e.g. Phenelzine) with an SSRI is strictly contraindicated, naming the life-threatening syndrome that can result."
    },
    reference: {
      answer: "Concurrent use causes massive elevation of synaptic serotonin levels, precipitating Serotonin Syndrome (or Serotonin Toxicity). Symptoms include hyperthermia, neuromuscular hyperactivity (clonus, tremor), and autonomic instability, which can be fatal."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_serotonin_syndrome",
          name: "Identifies Serotonin Syndrome",
          description: "Explicitly names 'Serotonin Syndrome' or 'Serotonin Toxicity'",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "(?i)serotonin\\s+(syndrome|toxicity)",
          is_critical: true
        },
        {
          criterion_id: "crit_mechanism_ss",
          name: "Pharmacodynamic Mechanism",
          description: "Explains inhibition of serotonin breakdown combined with reuptake blockade leads to toxic accumulation",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "hard",
      language: "en",
      tags: ["pharmacology", "drug-interactions", "neuroscience"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "bio_003",
    task_type: "qa",
    input: {
      prompt: "In statistical hypothesis testing, what does a p-value of 0.03 strictly represent? Distinguish this from the common misconception that it represents the probability that the null hypothesis is true."
    },
    reference: {
      answer: "A p-value of 0.03 means that, assuming the null hypothesis is true, there is a 3% probability of obtaining an effect or test statistic as extreme as or more extreme than the observed data. It is NOT the posterior probability that the null hypothesis is true P(H0|data)."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_p_val_definition",
          name: "Rigorous P-Value Definition",
          description: "States probability of observing data at least as extreme conditional on null hypothesis being true: P(data >= obs | H0)",
          weight: 60,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_p_val_misconception",
          name: "Refutes Inverse Fallacy",
          description: "Explicitly clarifies that p-value != P(H0 | data)",
          weight: 40,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "medium",
      language: "en",
      tags: ["statistics", "clinical-research", "epistemology"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "bio_004",
    task_type: "qa",
    input: {
      prompt: "State the Le Chatelier principle and predict the directional shift in chemical equilibrium for the exothermic Haber process N2(g) + 3H2(g) <=> 2NH3(g) (Delta H = -92.4 kJ/mol) when temperature is increased."
    },
    reference: {
      answer: "According to Le Chatelier's principle, a system at equilibrium subjected to a disturbance shifts in the direction that counteracts that disturbance. Because the forward reaction is exothermic (releases heat), increasing temperature shifts the equilibrium to the left (towards reactants N2 and H2), reducing ammonia yield."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_haber_shift",
          name: "Correct Directional Shift",
          description: "Must state shift to the left / towards reactants / decrease in NH3",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "(?i)(left|reactants|reverse)",
          is_critical: true
        },
        {
          criterion_id: "crit_haber_thermo",
          name: "Thermodynamic Justification",
          description: "Correctly identifies heat as a product in exothermic reactions",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "easy",
      language: "en",
      tags: ["chemistry", "thermodynamics", "equilibrium"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "bio_005",
    task_type: "qa",
    input: {
      prompt: "What is the rate-limiting enzyme in cholesterol biosynthesis, and what class of medications competitively inhibits it?"
    },
    reference: {
      answer: "The rate-limiting enzyme is HMG-CoA reductase (3-hydroxy-3-methylglutaryl-coenzyme A reductase). It is competitively inhibited by statins (HMG-CoA reductase inhibitors, such as atorvastatin, rosuvastatin)."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_hmg_enzyme",
          name: "Enzyme Identification",
          description: "Names HMG-CoA reductase",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "(?i)HMG[- ]?CoA reductase",
          is_critical: true
        },
        {
          criterion_id: "crit_statin_class",
          name: "Drug Class Identification",
          description: "Names statins",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "(?i)statins?"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "easy",
      language: "en",
      tags: ["biochemistry", "pharmacology", "cardiology"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },

  // --- DOMAIN 4: STRUCTURED JSON EXTRACTION (Schema Conformance & Exact Match) ---
  {
    task_id: "json_001",
    task_type: "extraction",
    input: {
      prompt: "Extract the patient data from this note into JSON matching schema: { 'patient_id': string, 'age': number, 'diagnoses': list[string], 'vital_signs': { 'bp_systolic': number, 'bp_diastolic': number, 'heart_rate': number } }.\nNote: 'Patient PT-4091 is a 64 year old female presenting with essential hypertension and type 2 diabetes. BP measured 142/88 mmHg, resting pulse 76 bpm.'"
    },
    reference: {
      answer: "{\n  \"patient_id\": \"PT-4091\",\n  \"age\": 64,\n  \"diagnoses\": [\"essential hypertension\", \"type 2 diabetes\"],\n  \"vital_signs\": {\n    \"bp_systolic\": 142,\n    \"bp_diastolic\": 88,\n    \"heart_rate\": 76\n  }\n}"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_valid_json",
          name: "Valid JSON Formatting",
          description: "Output must parse as syntactically valid JSON",
          weight: 30,
          scoring_type: "deterministic_regex",
          regex_pattern: "^\\s*\\{.*\\}\\s*$",
          is_critical: true
        },
        {
          criterion_id: "crit_schema_keys",
          name: "Mandatory Schema Keys",
          description: "Contains patient_id, age, diagnoses, and vital_signs object",
          weight: 30,
          scoring_type: "deterministic_regex",
          regex_pattern: "\"patient_id\".*\"vital_signs\""
        },
        {
          criterion_id: "crit_numeric_vitals",
          name: "Numeric Type Validation",
          description: "Ensures age=64, systolic=142, diastolic=88, heart_rate=76 as numbers",
          weight: 40,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Structured JSON",
      difficulty: "medium",
      language: "json",
      tags: ["clinical", "ner", "json-schema"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "json_002",
    task_type: "extraction",
    input: {
      prompt: "Extract financial invoice details from: 'Invoice INV-2024-884 issued by Acme Corp on 2024-11-15 for Subtotal $450.00, Tax $36.00, and Total $486.00.' Return pure JSON with keys: invoice_number, vendor, date, subtotal, tax, total. Amounts must be numbers."
    },
    reference: {
      answer: "{\n  \"invoice_number\": \"INV-2024-884\",\n  \"vendor\": \"Acme Corp\",\n  \"date\": \"2024-11-15\",\n  \"subtotal\": 450.00,\n  \"tax\": 36.00,\n  \"total\": 486.00\n}"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_inv_number",
          name: "Exact Invoice Key",
          description: "Matches 'INV-2024-884'",
          weight: 40,
          scoring_type: "deterministic_regex",
          regex_pattern: "\"INV-2024-884\"",
          is_critical: true
        },
        {
          criterion_id: "crit_totals_float",
          name: "Numbers Without Dollar Symbols",
          description: "Subtotal, tax, and total must be floats without '$'",
          weight: 60,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Structured JSON",
      difficulty: "easy",
      language: "json",
      tags: ["finance", "invoices", "information-extraction"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "json_003",
    task_type: "extraction",
    input: {
      prompt: "Parse flight reservation email into JSON: 'Flight UA382 departing SFO at 08:30 arriving ORD at 14:45 on 2025-03-10 in Seat 14B (Economy Plus)'. Return schema with keys: flight_code, origin, destination, departure_time, arrival_time, date, seat, cabin."
    },
    reference: {
      answer: "{\n  \"flight_code\": \"UA382\",\n  \"origin\": \"SFO\",\n  \"destination\": \"ORD\",\n  \"departure_time\": \"08:30\",\n  \"arrival_time\": \"14:45\",\n  \"date\": \"2025-03-10\",\n  \"seat\": \"14B\",\n  \"cabin\": \"Economy Plus\"\n}"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_airport_codes",
          name: "IATA Airport Codes",
          description: "Origin SFO and destination ORD accurately preserved",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "\"origin\":\\s*\"SFO\".*\"destination\":\\s*\"ORD\""
        },
        {
          criterion_id: "crit_cabin_parsing",
          name: "Cabin Classification",
          description: "Maps cabin to Economy Plus",
          weight: 50,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Structured JSON",
      difficulty: "easy",
      language: "json",
      tags: ["travel", "entities", "json"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  },
  {
    task_id: "json_004",
    task_type: "extraction",
    input: {
      prompt: "Extract candidate skills and seniority from: 'Senior Staff Engineer with 12 years experience leading distributed systems teams. Proficient in Go, Rust, Kubernetes, and Kafka.' Output JSON schema: { 'seniority_level': string, 'years_experience': number, 'skills': list[string] }."
    },
    reference: {
      answer: "{\n  \"seniority_level\": \"Senior Staff Engineer\",\n  \"years_experience\": 12,\n  \"skills\": [\"Go\", \"Rust\", \"Kubernetes\", \"Kafka\"]\n}"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_skills_array",
          name: "Skills Array Completeness",
          description: "All 4 technical skills captured: Go, Rust, Kubernetes, Kafka",
          weight: 50,
          scoring_type: "llm_judge"
        },
        {
          criterion_id: "crit_years_numeric",
          name: "Numeric Years Integer",
          description: "years_experience parsed as 12",
          weight: 50,
          scoring_type: "deterministic_regex",
          regex_pattern: "\"years_experience\":\\s*12",
          is_critical: true
        }
      ]
    },
    metadata: {
      domain: "Structured JSON",
      difficulty: "medium",
      language: "json",
      tags: ["hr", "resume-parsing", "entities"]
    },
    intended_use: ["evaluation", "sft", "dpo"],
    review_status: "approved"
  },
  {
    task_id: "json_005",
    task_type: "extraction",
    input: {
      prompt: "Extract sensor reading: 'Device IOT-SENS-990 recorded temperature 24.3 C, relative humidity 58.2%, battery level 87% at unix timestamp 1718002930.' Output schema: { 'device_id': string, 'timestamp': number, 'telemetry': { 'temp_celsius': number, 'humidity_percent': number, 'battery_percent': number } }."
    },
    reference: {
      answer: "{\n  \"device_id\": \"IOT-SENS-990\",\n  \"timestamp\": 1718002930,\n  \"telemetry\": {\n    \"temp_celsius\": 24.3,\n    \"humidity_percent\": 58.2,\n    \"battery_percent\": 87\n  }\n}"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "crit_device_id",
          name: "Device ID Exact Match",
          description: "device_id equals 'IOT-SENS-990'",
          weight: 40,
          scoring_type: "deterministic_regex",
          regex_pattern: "\"device_id\":\\s*\"IOT-SENS-990\"",
          is_critical: true
        },
        {
          criterion_id: "crit_nested_telemetry",
          name: "Nested Object Schema",
          description: "Telemetry sub-object with temp_celsius, humidity_percent, battery_percent",
          weight: 60,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Structured JSON",
      difficulty: "medium",
      language: "json",
      tags: ["iot", "sensors", "telemetry"]
    },
    intended_use: ["evaluation", "sft"],
    review_status: "approved"
  }
];

// Planted defective items to test Data Quality and Ingestion QA Scanner
export const RAW_INGESTION_DATASET_WITH_PLANTED_ERRORS: CanonicalTask[] = [
  ...BENCHMARK_TASKS,
  // Planted Error 1: Exact Duplicate (Duplicates math_001)
  {
    ...BENCHMARK_TASKS[0],
    is_planted_error: true,
    error_type: "duplicate"
  },
  // Planted Error 2: Missing Required Field (Empty prompt)
  {
    task_id: "err_missing_001",
    task_type: "qa",
    input: {
      prompt: "" // Corrupt! Missing prompt
    },
    reference: {
      answer: "A valid answer with no prompt."
    },
    rubric: {
      criteria: [
        {
          criterion_id: "c1",
          name: "Check",
          description: "Check description",
          weight: 100,
          scoring_type: "llm_judge"
        }
      ]
    },
    metadata: {
      domain: "Biomedical & QA",
      difficulty: "easy",
      language: "en"
    },
    intended_use: ["evaluation"],
    review_status: "draft",
    is_planted_error: true,
    error_type: "missing_field"
  },
  // Planted Error 3: Malformed Schema (Weight total != 100%, negative weight)
  {
    task_id: "err_schema_002",
    task_type: "math",
    input: {
      prompt: "Calculate 2 + 2."
    },
    reference: {
      answer: "4"
    },
    rubric: {
      criteria: [
        {
          criterion_id: "c_bad_1",
          name: "Criterion with negative weight",
          description: "Illegal weight distribution",
          weight: -20, // Corrupt! Negative weight
          scoring_type: "deterministic_exact"
        }
      ]
    },
    metadata: {
      domain: "Math & Reasoning",
      difficulty: "easy",
      language: "en"
    },
    intended_use: ["evaluation"],
    review_status: "draft",
    is_planted_error: true,
    error_type: "malformed_schema"
  }
];
