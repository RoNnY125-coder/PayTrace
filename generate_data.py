"""
generate_data.py
Generates realistic CSV data for SettlementTrace.

Scenario distribution (280 unique transaction IDs + 10 duplicated = 290 gateway rows):
  TXN001 – TXN100   : SETTLED            (100 txns) — the happy path
  TXN101 – TXN130   : DELAYED            (30 txns)  — bank pending
  TXN131 – TXN155   : LEDGER_DELAY       (25 txns)  — bank settled, ledger pending
  TXN156 – TXN175   : AMOUNT_MISMATCH    (20 txns)  — gateway ≠ bank amount
  TXN176 – TXN195   : MISSING_BANK       (20 txns)  — no bank / ledger record
  TXN196 – TXN215   : GATEWAY_FAILED     (20 txns)  — gateway FAILED
  TXN216 – TXN230   : BANK_REJECTED      (15 txns)  — bank REJECTED
  TXN231 – TXN245   : CURRENCY_MISMATCH  (15 txns)  — INR vs USD
  TXN246 – TXN260   : TIMESTAMP_ANOMALY  (15 txns)  — ledger posted BEFORE bank settled
  TXN261 – TXN270   : DUPLICATE          (10 IDs)   — 2 gateway rows each
  TXN271 – TXN280   : UNKNOWN_DELAYED    (10 txns)  — delayed, cause unknown

  DEMO001 – DEMO011 : Fixed demo transactions (preserved exactly)

Run:  python generate_data.py
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)  # Reproducible output

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# ── Helpers ────────────────────────────────────────────────────────────────

CURRENCIES = ["INR"] * 18 + ["USD", "EUR"]  # Mostly INR
AMOUNTS_BASE = [500, 750, 800, 950, 1000, 1200, 1250, 1500, 1800,
                2000, 2400, 2750, 3000, 3300, 3500, 4000, 4200,
                5000, 6000, 7500, 8000, 10000, 12000, 15000, 20000]


def rand_amount():
    return random.choice(AMOUNTS_BASE)


def rand_currency():
    return random.choice(CURRENCIES)


def dt(base: datetime, delta_minutes: int = 0, delta_seconds: int = 0) -> str:
    return (base + timedelta(minutes=delta_minutes, seconds=delta_seconds)).strftime(
        "%Y-%m-%d %H:%M:%S"
    )


def null():
    return ""


def rand_base_time(day_offset: int = 0) -> datetime:
    """Random timestamp on 2026-09-01 or nearby dates."""
    base = datetime(2026, 9, 1, 0, 0, 0) + timedelta(days=day_offset)
    return base + timedelta(
        hours=random.randint(6, 22),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59),
    )


def bank_ref(i: int) -> str:
    return f"BNK{10000 + i}"


def ledger_ref(i: int) -> str:
    return f"LED{20000 + i}"


def batch_id(i: int) -> str:
    return f"BATCH{5000 + (i // 10)}"  # ~10 txns per batch


def order_id(txn_id: str) -> str:
    return f"ORD{txn_id[3:]}"


# ── Writers ────────────────────────────────────────────────────────────────

gw_rows = []   # gateway.csv rows
bk_rows = []   # bank.csv rows
lg_rows = []   # ledger.csv rows


def add_settled(txn_id: str, i: int):
    """SETTLED: All 3 systems happy."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time(day_offset=random.randint(0, 2))
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 240))
    settled = dt(t0, delta_minutes=random.randint(241, 300))
    posted = dt(t0, delta_minutes=random.randint(301, 320))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "SETTLED",
                    received, settled, bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "POSTED", "CREDIT",
                    settled, posted, ledger_ref(i)])


def add_delayed(txn_id: str, i: int):
    """DELAYED: Bank PENDING, Ledger PENDING."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "PENDING",
                    received, null(), bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "PENDING", "CREDIT",
                    received, null(), ledger_ref(i)])


def add_ledger_delay(txn_id: str, i: int):
    """LEDGER_DELAY: Bank SETTLED, Ledger PENDING."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))
    settled = dt(t0, delta_minutes=random.randint(181, 240))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "SETTLED",
                    received, settled, bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "PENDING", "CREDIT",
                    settled, null(), ledger_ref(i)])


def add_amount_mismatch(txn_id: str, i: int):
    """AMOUNT_MISMATCH: Gateway and bank amounts differ."""
    gw_amount = rand_amount()
    # Bank receives a different (usually lower) amount
    delta = random.choice([-300, -200, -150, -100, -50, 50, 100, 200])
    bk_amount = max(100, gw_amount + delta)
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))
    settled = dt(t0, delta_minutes=random.randint(181, 240))
    posted = dt(t0, delta_minutes=random.randint(241, 260))

    gw_rows.append([txn_id, order_id(txn_id), gw_amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), bk_amount, currency, "SETTLED",
                    received, settled, bank_ref(i)])
    # Ledger reflects gateway amount (the discrepancy)
    lg_rows.append([txn_id, gw_amount, currency, "POSTED", "CREDIT",
                    settled, posted, ledger_ref(i)])


def add_missing_bank(txn_id: str, i: int):
    """MISSING_BANK: Only gateway record exists."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    # No bank or ledger rows


def add_gateway_failed(txn_id: str, i: int):
    """GATEWAY_FAILED: Gateway FAILED, nothing downstream."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "FAILED",
                    dt(t0), null(), batch_id(i)])
    # No bank or ledger rows


def add_bank_rejected(txn_id: str, i: int):
    """BANK_REJECTED: Bank REJECTED, Ledger REJECTED."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "REJECTED",
                    received, null(), bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "REJECTED", "CREDIT",
                    received, null(), ledger_ref(i)])


def add_currency_mismatch(txn_id: str, i: int):
    """CURRENCY_MISMATCH: Gateway INR, Bank USD."""
    amount = rand_amount()
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))
    settled = dt(t0, delta_minutes=random.randint(181, 240))
    posted = dt(t0, delta_minutes=random.randint(241, 260))

    gw_rows.append([txn_id, order_id(txn_id), amount, "INR", "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, "USD", "SETTLED",
                    received, settled, bank_ref(i)])
    lg_rows.append([txn_id, amount, "INR", "POSTED", "CREDIT",
                    settled, posted, ledger_ref(i)])


def add_timestamp_anomaly(txn_id: str, i: int):
    """TIMESTAMP_ANOMALY: Ledger posted BEFORE bank settled."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(60, 180))
    # Bank settles at +240 min
    settled = dt(t0, delta_minutes=240)
    # Ledger posted at +200 min (BEFORE bank settled — anomaly!)
    posted = dt(t0, delta_minutes=200)
    ledger_created = dt(t0, delta_minutes=190)

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "SETTLED",
                    received, settled, bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "POSTED", "CREDIT",
                    ledger_created, posted, ledger_ref(i)])


def add_duplicate(txn_id: str, i: int):
    """DUPLICATE: Two gateway records with the same transaction_id."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured1 = dt(t0, delta_seconds=random.randint(3, 10))
    captured2 = dt(t0, delta_seconds=random.randint(11, 20))

    # Two gateway rows, same txn_id
    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured1, batch_id(i)])
    gw_rows.append([txn_id, f"ORD{txn_id[3:]}B", amount, currency, "CAPTURED",
                    dt(t0, delta_seconds=5), captured2, batch_id(i)])
    # Bank and ledger exist (settled successfully — but duplicate is the problem)
    received = dt(t0, delta_minutes=random.randint(60, 180))
    settled = dt(t0, delta_minutes=random.randint(181, 240))
    posted = dt(t0, delta_minutes=random.randint(241, 260))
    bk_rows.append([txn_id, batch_id(i), amount, currency, "SETTLED",
                    received, settled, bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "POSTED", "CREDIT",
                    settled, posted, ledger_ref(i)])


def add_unknown_delayed(txn_id: str, i: int):
    """UNKNOWN/DELAYED: Gateway CAPTURED, Bank PENDING, Ledger PENDING — cause unknown."""
    amount = rand_amount()
    currency = "INR"
    t0 = rand_base_time()
    captured = dt(t0, delta_seconds=random.randint(3, 10))
    received = dt(t0, delta_minutes=random.randint(30, 90))

    gw_rows.append([txn_id, order_id(txn_id), amount, currency, "CAPTURED",
                    dt(t0), captured, batch_id(i)])
    bk_rows.append([txn_id, batch_id(i), amount, currency, "PENDING",
                    received, null(), bank_ref(i)])
    lg_rows.append([txn_id, amount, currency, "PENDING", "CREDIT",
                    received, null(), ledger_ref(i)])


# ── DEMO transactions (fixed, never change) ────────────────────────────────

DEMO_GW = [
    ["DEMO001","ORD5001",1250,"INR","CAPTURED","2026-09-01 10:12:31","2026-09-01 10:12:35","BATCH001"],
    ["DEMO002","ORD5002",2400,"INR","CAPTURED","2026-09-01 12:01:48","2026-09-01 12:01:52","BATCH002"],
    ["DEMO003","ORD5003",3100,"INR","CAPTURED","2026-09-01 09:30:00","2026-09-01 09:30:05","BATCH003"],
    ["DEMO004","ORD5004",1500,"INR","CAPTURED","2026-09-01 11:00:00","2026-09-01 11:00:04","BATCH004"],
    ["DEMO005","ORD5005",800, "INR","CAPTURED","2026-09-01 13:45:00","2026-09-01 13:45:03","BATCH005"],
    ["DEMO006","ORD5006",4200,"INR","FAILED",  "2026-09-01 14:20:00","",                  "BATCH006"],
    ["DEMO007","ORD5007",950, "INR","CAPTURED","2026-09-01 15:10:00","2026-09-01 15:10:06","BATCH007"],
    ["DEMO008","ORD5008",2200,"INR","CAPTURED","2026-09-01 16:00:00","2026-09-01 16:00:04","BATCH008"],
    ["DEMO009","ORD5009",1800,"INR","CAPTURED","2026-09-01 08:00:00","2026-09-01 08:00:03","BATCH009"],
    ["DEMO010","ORD5010",3300,"INR","CAPTURED","2026-09-01 17:00:00","2026-09-01 17:00:05","BATCH010"],
    ["DEMO010","ORD5010B",3300,"INR","CAPTURED","2026-09-01 17:00:10","2026-09-01 17:00:15","BATCH010"],
    ["DEMO011","ORD5011",5000,"INR","CAPTURED","2026-09-01 18:30:00","2026-09-01 18:30:04","BATCH011"],
]

DEMO_BK = [
    ["DEMO001","BATCH001",1250,"INR","SETTLED", "2026-09-01 14:00:00","2026-09-01 14:05:12","BNK9001"],
    ["DEMO002","BATCH002",2400,"INR","PENDING", "2026-09-01 15:00:00","",                  "BNK9002"],
    ["DEMO003","BATCH003",3100,"INR","SETTLED", "2026-09-01 12:00:00","2026-09-01 12:10:00","BNK9003"],
    ["DEMO004","BATCH004",1200,"INR","SETTLED", "2026-09-01 14:30:00","2026-09-01 14:35:00","BNK9004"],
    ["DEMO007","BATCH007",950, "INR","REJECTED","2026-09-01 17:00:00","",                  "BNK9007"],
    ["DEMO008","BATCH008",2200,"USD","SETTLED", "2026-09-01 18:30:00","2026-09-01 18:35:00","BNK9008"],
    ["DEMO009","BATCH009",1800,"INR","SETTLED", "2026-09-01 11:00:00","2026-09-01 15:00:00","BNK9009"],
    ["DEMO010","BATCH010",3300,"INR","SETTLED", "2026-09-01 19:30:00","2026-09-01 19:35:00","BNK9010"],
    ["DEMO011","BATCH011",5000,"INR","PENDING", "2026-09-01 21:00:00","",                  "BNK9011"],
]

DEMO_LG = [
    ["DEMO001",1250,"INR","POSTED",  "CREDIT","2026-09-01 14:06:00","2026-09-01 14:07:01","LED1001"],
    ["DEMO002",2400,"INR","PENDING", "CREDIT","2026-09-01 15:01:00","",                  "LED1002"],
    ["DEMO003",3100,"INR","PENDING", "CREDIT","2026-09-01 12:11:00","",                  "LED1003"],
    ["DEMO004",1500,"INR","POSTED",  "CREDIT","2026-09-01 14:36:00","2026-09-01 14:37:00","LED1004"],
    ["DEMO007",950, "INR","REJECTED","CREDIT","2026-09-01 17:01:00","",                  "LED1007"],
    ["DEMO008",2200,"INR","POSTED",  "CREDIT","2026-09-01 18:36:00","2026-09-01 18:37:00","LED1008"],
    ["DEMO009",1800,"INR","POSTED",  "CREDIT","2026-09-01 14:00:00","2026-09-01 14:00:30","LED1009"],
    ["DEMO010",3300,"INR","POSTED",  "CREDIT","2026-09-01 19:36:00","2026-09-01 19:37:00","LED1010"],
    ["DEMO011",5000,"INR","PENDING", "CREDIT","2026-09-01 21:01:00","",                  "LED1011"],
]


# ── Generate all scenarios ─────────────────────────────────────────────────

i = 1  # global counter for bank_ref / ledger_ref uniqueness

# SETTLED: TXN001–TXN100
for n in range(1, 101):
    txn_id = f"TXN{n:03d}"
    add_settled(txn_id, i); i += 1

# DELAYED: TXN101–TXN130
for n in range(101, 131):
    txn_id = f"TXN{n:03d}"
    add_delayed(txn_id, i); i += 1

# LEDGER_DELAY: TXN131–TXN155
for n in range(131, 156):
    txn_id = f"TXN{n:03d}"
    add_ledger_delay(txn_id, i); i += 1

# AMOUNT_MISMATCH: TXN156–TXN175
for n in range(156, 176):
    txn_id = f"TXN{n:03d}"
    add_amount_mismatch(txn_id, i); i += 1

# MISSING_BANK: TXN176–TXN195
for n in range(176, 196):
    txn_id = f"TXN{n:03d}"
    add_missing_bank(txn_id, i); i += 1

# GATEWAY_FAILED: TXN196–TXN215
for n in range(196, 216):
    txn_id = f"TXN{n:03d}"
    add_gateway_failed(txn_id, i); i += 1

# BANK_REJECTED: TXN216–TXN230
for n in range(216, 231):
    txn_id = f"TXN{n:03d}"
    add_bank_rejected(txn_id, i); i += 1

# CURRENCY_MISMATCH: TXN231–TXN245
for n in range(231, 246):
    txn_id = f"TXN{n:03d}"
    add_currency_mismatch(txn_id, i); i += 1

# TIMESTAMP_ANOMALY: TXN246–TXN260
for n in range(246, 261):
    txn_id = f"TXN{n:03d}"
    add_timestamp_anomaly(txn_id, i); i += 1

# DUPLICATE: TXN261–TXN270 (each has 2 gateway rows)
for n in range(261, 271):
    txn_id = f"TXN{n:03d}"
    add_duplicate(txn_id, i); i += 1

# UNKNOWN_DELAYED: TXN271–TXN280
for n in range(271, 281):
    txn_id = f"TXN{n:03d}"
    add_unknown_delayed(txn_id, i); i += 1


# ── Write CSVs ─────────────────────────────────────────────────────────────

GW_HEADER  = ["transaction_id","order_id","amount","currency","status",
               "created_at","captured_at","settlement_batch"]
BK_HEADER  = ["transaction_id","batch_id","amount","currency","status",
               "received_at","settled_at","bank_reference"]
LG_HEADER  = ["transaction_id","amount","currency","status","entry_type",
               "created_at","posted_at","ledger_reference"]


def write_csv(path, header, demo_rows, generated_rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        for row in demo_rows:
            w.writerow(row)
        for row in generated_rows:
            w.writerow(row)
    print(f"Written {path}  ({len(demo_rows) + len(generated_rows)} rows)")


write_csv(DATA_DIR / "gateway.csv", GW_HEADER, DEMO_GW, gw_rows)
write_csv(DATA_DIR / "bank.csv",    BK_HEADER, DEMO_BK, bk_rows)
write_csv(DATA_DIR / "ledger.csv",  LG_HEADER, DEMO_LG, lg_rows)

# ── Summary ────────────────────────────────────────────────────────────────
print()
print("=" * 55)
print("Transaction distribution:")
print(f"  SETTLED            TXN001–TXN100   100 txns")
print(f"  DELAYED            TXN101–TXN130    30 txns")
print(f"  LEDGER_DELAY       TXN131–TXN155    25 txns")
print(f"  AMOUNT_MISMATCH    TXN156–TXN175    20 txns")
print(f"  MISSING_BANK       TXN176–TXN195    20 txns")
print(f"  GATEWAY_FAILED     TXN196–TXN215    20 txns")
print(f"  BANK_REJECTED      TXN216–TXN230    15 txns")
print(f"  CURRENCY_MISMATCH  TXN231–TXN245    15 txns")
print(f"  TIMESTAMP_ANOMALY  TXN246–TXN260    15 txns")
print(f"  DUPLICATE          TXN261–TXN270    10 txns (20 gw rows)")
print(f"  UNKNOWN_DELAYED    TXN271–TXN280    10 txns")
print(f"  DEMO               DEMO001–DEMO011  11 txns")
print(f"  {'-'*40}")
print(f"  Total unique IDs:  291")
print(f"  Total gateway rows: {len(DEMO_GW) + len(gw_rows)}")
print(f"  Total bank rows:    {len(DEMO_BK) + len(bk_rows)}")
print(f"  Total ledger rows:  {len(DEMO_LG) + len(lg_rows)}")
print("=" * 55)
