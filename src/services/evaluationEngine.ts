import { CanonicalTask, TaskEvaluationResult, CriterionScore } from '../types/canonical';

// Pre-defined realistic model outputs for Model A (Baseline-8B) vs Model B (Expert-70B)
const MODEL_A_OUTPUTS: Record<string, { output: string; latency_ms: number; tokens: number }> = {
  math_001: {
    output: "The formula is R = v^2 * sin(2*theta) / g. With theta = 45, sin(90) = 1. So R = (28)^2 / 9.8 = 784 / 9.8 = 82.5 meters.",
    latency_ms: 320,
    tokens: 42
  },
  math_002: {
    output: "A = 10000 * (1 + 0.06/4)^(4*3) = 10000 * (1.015)^12 = 10000 * 1.195618 = 11956.18. The total amount is $11,956.18.", // Failed: forgot to subtract principal!
    latency_ms: 410,
    tokens: 49
  },
  math_003: {
    output: "Expanding along row 1: det = 3*(16 - 5) - 2*(0 - (-10)) - 1*(0 - (-8)) = 3*11 - 2*10 - 1*8 = 33 - 20 - 8 = 5.", // Failed calculation arithmetic error
    latency_ms: 540,
    tokens: 58
  },
  math_004: {
    output: "Pairs giving at least 10: (4,6), (5,5), (5,6), (6,4), (6,5), (6,6). There are 6 winning combinations out of 36. The probability is 6/36, which simplifies to 1/6.",
    latency_ms: 290,
    tokens: 38
  },
  math_005: {
    output: "The integrating factor is e^(2x). Multiplying through: d/dx[y*e^(2x)] = 4*e^(2x). Integrating gives y*e^(2x) = 2*e^(2x) + C, so y = 2 + C*e^(-2x). At x=0, 5 = 2 + C, so C = 3. Final answer: y(x) = 2 + 3*e^(-2*x).",
    latency_ms: 610,
    tokens: 72
  },
  code_001: {
    output: "def max_subarray_sum(nums: list[int]) -> int:\n    max_so_far = 0\n    current = 0\n    for x in nums:\n        current = max(0, current + x)\n        max_so_far = max(max_so_far, current)\n    return max_so_far", // Classic bug: returns 0 for all-negative arrays!
    latency_ms: 380,
    tokens: 55
  },
  code_002: {
    output: "def singleton(cls):\n    instances = {}\n    def get_instance(*args, **kwargs):\n        if cls not in instances:\n            instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return get_instance", // Missing thread lock!
    latency_ms: 430,
    tokens: 50
  },
  code_003: {
    output: "def is_valid_bst(root):\n    if not root:\n        return True\n    if root.left and root.left.val >= root.val:\n        return False\n    if root.right and root.right.val <= root.val:\n        return False\n    return is_valid_bst(root.left) and is_valid_bst(root.right)", // Classic bug: only checks immediate children!
    latency_ms: 490,
    tokens: 61
  },
  code_004: {
    output: "def rotate(matrix: list[list[int]]) -> None:\n    n = len(matrix)\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for row in matrix:\n        row.reverse()",
    latency_ms: 360,
    tokens: 48
  },
  code_005: {
    output: "import asyncio, time\nasync def fetch_with_retry(fetch_fn, max_retries=3, backoff_factor=1.5):\n    delay = 1.0\n    for i in range(max_retries):\n        try:\n            return await fetch_fn()\n        except Exception as e:\n            time.sleep(delay) # Blocking sleep bug!\n            delay *= backoff_factor\n    raise Exception('Retries exhausted')",
    latency_ms: 510,
    tokens: 68
  },
  bio_001: {
    output: "The PAM sequence for Cas9 is typically NAG or NGG depending on the species.", // Vague, doesn't emphasize SpCas9 canonical or self-cleavage protection
    latency_ms: 340,
    tokens: 36
  },
  bio_002: {
    output: "Combining MAO inhibitors with SSRIs can cause dangerous high serotonin levels, leading to Serotonin Syndrome characterized by severe hyperthermia, seizures, and cardiovascular collapse.",
    latency_ms: 450,
    tokens: 42
  },
  bio_003: {
    output: "A p-value of 0.03 means there is a 3% chance the null hypothesis is true, so we reject it.", // Inverse fallacy bug!
    latency_ms: 310,
    tokens: 28
  },
  bio_004: {
    output: "According to Le Chatelier, adding heat shifts the equilibrium to the right because the reaction needs to absorb heat.", // Hallucination: flipped direction!
    latency_ms: 390,
    tokens: 35
  },
  bio_005: {
    output: "The rate limiting enzyme is HMG-CoA reductase, which is competitively inhibited by the statin drug class.",
    latency_ms: 270,
    tokens: 26
  },
  json_001: {
    output: "{\n  \"patient\": \"PT-4091\",\n  \"age\": \"64 years\",\n  \"diagnoses\": [\"hypertension\", \"diabetes\"],\n  \"bp\": \"142/88\"\n}", // Schema non-conformance: age is string, missing vital_signs nested object!
    latency_ms: 440,
    tokens: 52
  },
  json_002: {
    output: "{\n  \"invoice_number\": \"INV-2024-884\",\n  \"vendor\": \"Acme Corp\",\n  \"date\": \"2024-11-15\",\n  \"subtotal\": \"$450.00\",\n  \"tax\": \"$36.00\",\n  \"total\": \"$486.00\"\n}", // Formatted as strings with dollar signs instead of numbers
    latency_ms: 380,
    tokens: 58
  },
  json_003: {
    output: "{\n  \"flight_code\": \"UA382\",\n  \"origin\": \"SFO\",\n  \"destination\": \"ORD\",\n  \"departure_time\": \"08:30\",\n  \"arrival_time\": \"14:45\",\n  \"date\": \"2025-03-10\",\n  \"seat\": \"14B\",\n  \"cabin\": \"Economy Plus\"\n}",
    latency_ms: 410,
    tokens: 65
  },
  json_004: {
    output: "{\n  \"seniority_level\": \"Senior Staff Engineer\",\n  \"years_experience\": 12,\n  \"skills\": [\"Go\", \"Rust\", \"Kubernetes\"]\n}", // Dropped Kafka from skills!
    latency_ms: 350,
    tokens: 40
  },
  json_005: {
    output: "{\n  \"device_id\": \"IOT-SENS-990\",\n  \"timestamp\": 1718002930,\n  \"telemetry\": {\n    \"temp_celsius\": 24.3,\n    \"humidity_percent\": 58.2,\n    \"battery_percent\": 87\n  }\n}",
    latency_ms: 420,
    tokens: 54
  }
};

const MODEL_B_OUTPUTS: Record<string, { output: string; latency_ms: number; tokens: number }> = {
  math_001: {
    output: "To calculate horizontal range: R = (v^2 * sin(2*theta)) / g. Given v = 28 m/s, theta = 45 degrees (so 2*theta = 90 deg, sin(90) = 1), and g = 9.8 m/s^2:\nR = (28^2 * 1) / 9.8 = 784 / 9.8 = 80.0 meters.",
    latency_ms: 410,
    tokens: 58
  },
  math_002: {
    output: "Formula for compound interest: CI = P * [(1 + r/n)^(n*t) - 1].\nGiven P = 10000, r = 0.06, n = 4, t = 3:\nA = 10000 * (1 + 0.015)^12 = 10000 * 1.19561817 = $11,956.18.\nCompound interest = A - P = $11,956.18 - $10,000 = $1956.18.",
    latency_ms: 480,
    tokens: 68
  },
  math_003: {
    output: "We calculate determinant of [[3, 2, -1], [0, 4, 5], [-2, 1, 4]] expanding along Column 1:\ndet = 3 * det([[4, 5], [1, 4]]) - 0 + (-2) * det([[2, -1], [4, 5]])\n= 3 * (16 - 5) - 2 * (10 - (-4))\n= 3 * (11) - 2 * (14)\n= 33 - 28 ? Wait, column 1 expansion: row 3 col 1 is -2. Minor is [[2,-1],[4,5]] = 10 - (-4) = 14. 3(11) - 2(14) = 33 + 34 = 67. The exact determinant is 67.",
    latency_ms: 620,
    tokens: 95
  },
  math_004: {
    output: "The sample space of two dice has 6 * 6 = 36 outcomes. Out of these, sums >= 10 are:\n- Sum 10: (4,6), (5,5), (6,4) [3 pairs]\n- Sum 11: (5,6), (6,5) [2 pairs]\n- Sum 12: (6,6) [1 pair]\nTotal favorable outcomes = 6. Probability = 6/36 = 1/6.",
    latency_ms: 380,
    tokens: 65
  },
  math_005: {
    output: "For dy/dx + 2y = 4, integrating factor I(x) = e^(int 2 dx) = e^(2x).\nMultiplying: d/dx [y*e^(2x)] = 4*e^(2x).\nIntegrating: y*e^(2x) = 2*e^(2x) + C, so y(x) = 2 + C*e^(-2x).\nUsing y(0) = 5: 5 = 2 + C => C = 3.\nTherefore, y(x) = 2 + 3*e^(-2*x).",
    latency_ms: 550,
    tokens: 82
  },
  code_001: {
    output: "def max_subarray_sum(nums: list[int]) -> int:\n    if not nums:\n        return 0\n    max_so_far = max_ending_here = nums[0]\n    for x in nums[1:]:\n        max_ending_here = max(x, max_ending_here + x)\n        max_so_far = max(max_so_far, max_ending_here)\n    return max_so_far",
    latency_ms: 420,
    tokens: 58
  },
  code_002: {
    output: "import threading\nfrom functools import wraps\n\ndef singleton(cls):\n    instances = {}\n    lock = threading.Lock()\n    @wraps(cls)\n    def get_instance(*args, **kwargs):\n        with lock:\n            if cls not in instances:\n                instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return get_instance",
    latency_ms: 510,
    tokens: 68
  },
  code_003: {
    output: "def is_valid_bst(root, low=float('-inf'), high=float('inf')):\n    if not root:\n        return True\n    if not (low < root.val < high):\n        return False\n    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)",
    latency_ms: 470,
    tokens: 60
  },
  code_004: {
    output: "def rotate(matrix: list[list[int]]) -> None:\n    n = len(matrix)\n    # Step 1: Transpose matrix in-place\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    # Step 2: Reverse each row\n    for row in matrix:\n        row.reverse()",
    latency_ms: 450,
    tokens: 62
  },
  code_005: {
    output: "import asyncio\n\nasync def fetch_with_retry(fetch_fn, max_retries=3, backoff_factor=1.5):\n    delay = 1.0\n    for attempt in range(max_retries):\n        try:\n            return await fetch_fn()\n        except Exception as e:\n            if attempt == max_retries - 1:\n                raise e\n            await asyncio.sleep(delay)\n            delay *= backoff_factor",
    latency_ms: 590,
    tokens: 75
  },
  bio_001: {
    output: "In CRISPR-Cas9 genome editing, the protospacer adjacent motif (PAM) is a mandatory 2-6 base pair sequence immediately downstream of the target DNA. Cas9 requires PAM binding to trigger DNA unwinding and subsequent R-loop formation. Importantly, PAM absence in the host bacterial CRISPR array prevents self-cleavage. For Streptococcus pyogenes Cas9 (SpCas9), the canonical PAM sequence is 5'-NGG-3'.",
    latency_ms: 510,
    tokens: 78
  },
  bio_002: {
    output: "Concurrent use of MAO inhibitors (like Phenelzine) with SSRIs is strictly contraindicated due to the extreme risk of Serotonin Syndrome. MAOIs block serotonin catabolism while SSRIs inhibit its reuptake, resulting in massive, uncontrolled postsynaptic serotonin hyperstimulation causing hyperthermia, myoclonus, and potential death.",
    latency_ms: 490,
    tokens: 68
  },
  bio_003: {
    output: "A p-value of 0.03 strictly represents P(data at least as extreme as observed | H0 is true). It does NOT represent the probability that the null hypothesis is true P(H0|data), which would be an inverse probability fallacy without prior distribution knowledge.",
    latency_ms: 430,
    tokens: 58
  },
  bio_004: {
    output: "Le Chatelier's principle states that a system in dynamic equilibrium adjusts to counteract imposed disturbances. For the Haber process N2(g) + 3H2(g) <=> 2NH3(g), the reaction is exothermic (Delta H = -92.4 kJ/mol). Increasing temperature adds thermal energy to the system, causing the equilibrium to shift to the left (toward reactants) to consume excess heat, thereby decreasing the equilibrium yield of NH3.",
    latency_ms: 560,
    tokens: 84
  },
  bio_005: {
    output: "The rate-limiting enzyme in hepatic cholesterol synthesis is HMG-CoA reductase (3-hydroxy-3-methylglutaryl-coenzyme A reductase). This enzyme is competitively inhibited by the statin class of cardiovascular medications (e.g. atorvastatin, simvastatin).",
    latency_ms: 380,
    tokens: 48
  },
  json_001: {
    output: "{\n  \"patient_id\": \"PT-4091\",\n  \"age\": 64,\n  \"diagnoses\": [\"essential hypertension\", \"type 2 diabetes\"],\n  \"vital_signs\": {\n    \"bp_systolic\": 142,\n    \"bp_diastolic\": 88,\n    \"heart_rate\": 76\n  }\n}",
    latency_ms: 460,
    tokens: 64
  },
  json_002: {
    output: "{\n  \"invoice_number\": \"INV-2024-884\",\n  \"vendor\": \"Acme Corp\",\n  \"date\": \"2024-11-15\",\n  \"subtotal\": 450.00,\n  \"tax\": 36.00,\n  \"total\": 486.00\n}",
    latency_ms: 430,
    tokens: 60
  },
  json_003: {
    output: "{\n  \"flight_code\": \"UA382\",\n  \"origin\": \"SFO\",\n  \"destination\": \"ORD\",\n  \"departure_time\": \"08:30\",\n  \"arrival_time\": \"14:45\",\n  \"date\": \"2025-03-10\",\n  \"seat\": \"14B\",\n  \"cabin\": \"Economy Plus\"\n}",
    latency_ms: 440,
    tokens: 65
  },
  json_004: {
    output: "{\n  \"seniority_level\": \"Senior Staff Engineer\",\n  \"years_experience\": 12,\n  \"skills\": [\"Go\", \"Rust\", \"Kubernetes\", \"Kafka\"]\n}",
    latency_ms: 400,
    tokens: 52
  },
  json_005: {
    output: "{\n  \"device_id\": \"IOT-SENS-990\",\n  \"timestamp\": 1718002930,\n  \"telemetry\": {\n    \"temp_celsius\": 24.3,\n    \"humidity_percent\": 58.2,\n    \"battery_percent\": 87\n  }\n}",
    latency_ms: 450,
    tokens: 62
  }
};

// Helper: extract floating point number from output text near key terms
function extractNumberFromText(text: string): number | null {
  // Matches e.g. "80.0", "1956.18", "67", "82.5"
  const matches = text.match(/-?\d+(\.\d+)?/g);
  if (matches && matches.length > 0) {
    // Return last number mentioned, typically the final answer
    return parseFloat(matches[matches.length - 1]);
  }
  return null;
}

export function evaluateTaskModelOutput(
  task: CanonicalTask,
  modelId: 'model_a' | 'model_b'
): TaskEvaluationResult {
  const modelName = modelId === 'model_a' ? 'Baseline Checkpoint (8B-Base)' : 'Expert Fine-Tuned (70B-Aligned)';
  const modelOutputs = modelId === 'model_a' ? MODEL_A_OUTPUTS : MODEL_B_OUTPUTS;
  const mockData = modelOutputs[task.task_id] || {
    output: task.reference.answer,
    latency_ms: 350,
    tokens: 45
  };

  const criterionScores: CriterionScore[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let criticalFailure = false;
  let criticalReason = '';

  for (const crit of task.rubric.criteria) {
    let score = 0;
    let evidence = '';
    const output = mockData.output;

    // STEP 1: DETERMINISTIC CHECKS TAKE PRECEDENCE
    if (crit.scoring_type === 'deterministic_exact') {
      const normalizedRef = (task.reference.answer || '').trim().toLowerCase();
      const normalizedOut = output.trim().toLowerCase();
      const pass = normalizedOut.includes(normalizedRef);
      score = pass ? 100 : 0;
      evidence = pass
        ? `Deterministic exact match verified: '${task.reference.answer}' found in response.`
        : `Deterministic exact match failed: expected '${task.reference.answer}'.`;
    } else if (crit.scoring_type === 'deterministic_tolerance') {
      const targetVal = task.reference.numeric_value ?? parseFloat(task.reference.answer);
      const extractedVal = extractNumberFromText(output);
      const tolerance = crit.tolerance ?? 0.01;

      if (extractedVal !== null && !isNaN(extractedVal) && !isNaN(targetVal)) {
        const diff = Math.abs(extractedVal - targetVal);
        const pass = diff <= tolerance;
        score = pass ? 100 : Math.max(0, Math.round((1 - diff / (targetVal || 1)) * 100));
        evidence = `Numeric tolerance check: target=${targetVal}, extracted=${extractedVal}, delta=${diff.toFixed(3)}, tolerance=+/-${tolerance} (Pass: ${pass})`;
      } else {
        score = 0;
        evidence = `Numeric parse error: unable to locate valid numeric output for tolerance check.`;
      }
    } else if (crit.scoring_type === 'deterministic_regex') {
      const pattern = crit.regex_pattern || '';
      try {
        const regex = new RegExp(pattern, 'i');
        const pass = regex.test(output);
        score = pass ? 100 : 0;
        evidence = pass
          ? `Deterministic regex verified: pattern /${pattern}/ matched response.`
          : `Deterministic regex failed: pattern /${pattern}/ was not matched in response.`;
      } catch (e) {
        score = 0;
        evidence = `Regex compilation error in rubric criterion.`;
      }
    } else {
      // STEP 2: LLM JUDGE FOR SEMANTIC / METHODOLOGICAL CRITERIA
      if (modelId === 'model_a') {
        // Model A has some flaws
        if (task.task_id === 'code_001' && crit.criterion_id === 'crit_kadane_all_neg') {
          score = 0;
          evidence = `Judge critique: Model initialized current sum to 0 instead of nums[0], yielding 0 on all-negative arrays. Critical logic error.`;
        } else if (task.task_id === 'code_003' && crit.criterion_id === 'crit_bst_boundary') {
          score = 15;
          evidence = `Judge critique: Model only checks immediate child nodes without propagating min/max interval constraints, failing on invalid descendant subtrees.`;
        } else if (task.task_id === 'bio_003') {
          score = 10;
          evidence = `Judge critique: Response commits the inverse probability fallacy by stating p=0.03 means 3% chance the null is true.`;
        } else if (task.task_id === 'bio_004') {
          score = 0;
          evidence = `Judge critique: Response hallucinated that exothermic reactions shift to the right with temperature increase.`;
        } else {
          score = Math.floor(70 + Math.random() * 25);
          evidence = `Judge critique: Output provides adequate explanation meeting rubric guidelines with minor stylistic variations.`;
        }
      } else {
        // Model B (Expert) excels
        score = Math.floor(92 + Math.random() * 8);
        evidence = `Judge critique: Rigorous and complete response perfectly adhering to domain standards and rubric requirements.`;
      }
    }

    const pass = score >= 60;
    if (crit.is_critical && !pass) {
      criticalFailure = true;
      criticalReason = `Critical criterion '${crit.name}' failed with score ${score}/100: ${evidence}`;
    }

    totalWeightedScore += (score * crit.weight);
    totalWeight += crit.weight;

    criterionScores.push({
      criterion_id: crit.criterion_id,
      name: crit.name,
      score,
      pass,
      grader_type: crit.scoring_type,
      evidence
    });
  }

  let finalTaskScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  if (criticalFailure) {
    finalTaskScore = 0;
  }

  return {
    task_id: task.task_id,
    model_id: modelId,
    model_name: modelName,
    task_score: finalTaskScore,
    passed: finalTaskScore >= 70,
    critical_failure: criticalFailure,
    failure_reason: criticalFailure ? criticalReason : undefined,
    criterion_scores: criterionScores,
    output: mockData.output,
    latency_ms: mockData.latency_ms,
    tokens_used: mockData.tokens,
    confidence: modelId === 'model_b' ? 0.94 : 0.68,
    is_simulated: true
  };
}
