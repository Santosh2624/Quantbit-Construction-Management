# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import strip_html


def execute(filters=None):

    columns = get_columns()
    data = get_data(filters)

    return columns, data


def get_columns():

    return [

        {
            "label": "Sr. No.",
            "fieldname": "sr_no",
            "fieldtype": "Data",
            "width": 80
        },
        {
            "label": "Specification",
            "fieldname": "specification",
            "fieldtype": "Data",
            "width": 100
        },
        {
            "label": "Unit",
            "fieldname": "unit",
            "fieldtype": "Data",
            "width": 100
        },
        {
            "label": "Qty",
            "fieldname": "qty",
            "fieldtype": "Float",
            "width": 100
        },
        {
            "label": "Rate",
            "fieldname": "rate",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "label": "Amount",
            "fieldname": "amount",
            "fieldtype": "Currency",
            "width": 120
        }

    ]


def get_data(filters):

    boq = filters.get("bill_of_quantities")

    boq_doc = frappe.get_doc("Bill of Quantities", boq)

    data = []

    sr_no = 1

    # Group by Subtask -> Item Type
    subtask_group = {}

    for row in boq_doc.boq_items:

        subtask = row.subtask or "Others"
        item_type = row.item_type or "Others"

        if subtask not in subtask_group:
            subtask_group[subtask] = {}

        if item_type not in subtask_group[subtask]:
            subtask_group[subtask][item_type] = []

        subtask_group[subtask][item_type].append(row)

    # Render Report
    for subtask, item_types in subtask_group.items():

        # Get Subtask Details
        subtask_doc = frappe.get_doc("Task", subtask)

        # Subtask Header
        data.append({
            "sr_no": "",
            "specification": f"SUBTASK : {subtask}",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None,
            "bold": 1
        })

        # Subtask Subject
        data.append({
            "sr_no": "",
            "specification": f"Subject : {subtask_doc.subject or ''}",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })

        # Subtask Description
        data.append({
            "sr_no": "",
            "specification": (
                f"Description : "
                f"{strip_html(subtask_doc.description or '')}"
            ),
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })

        # Spacer Row
        data.append({
            "sr_no": "",
            "specification": "",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })

        subtask_total = 0

        # Fixed Order
        ordered_types = ["Man", "Material", "Equipment"]

        for item_type in ordered_types:

            rows = item_types.get(item_type, [])

            if not rows:
                continue

            # Item Type Header
            data.append({
                "sr_no": "",
                "specification": item_type.upper(),
                "unit": "",
                "qty": None,
                "rate": None,
                "amount": None,
                "bold": 1
            })

            item_type_total = 0

            for row in rows:

                data.append({
                    "sr_no": sr_no,
                    "specification": row.item_code,
                    "unit": row.unit,
                    "qty": row.quantity,
                    "rate": row.unit_rate,
                    "amount": row.amount
                })

                item_type_total += row.amount or 0
                subtask_total += row.amount or 0

                sr_no += 1

            # Item Type Total
            data.append({
                "sr_no": "",
                "specification": f"{item_type} Total",
                "unit": "",
                "qty": None,
                "rate": None,
                "amount": item_type_total,
                "bold": 1
            })

            # Spacer Row
            data.append({
                "sr_no": "",
                "specification": "",
                "unit": "",
                "qty": None,
                "rate": None,
                "amount": None
            })

        # Subtask Grand Total
        data.append({
            "sr_no": "",
            "specification": f"{subtask} Grand Total",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": subtask_total,
            "bold": 1
        })

        # Double Spacer
        data.append({
            "sr_no": "",
            "specification": "",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })

        data.append({
            "sr_no": "",
            "specification": "",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })

    return data