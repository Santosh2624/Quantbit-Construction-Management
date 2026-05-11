# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import strip_html,cstr


def execute(filters=None):

    columns = get_columns()
    data = get_data(filters)

    return columns, data


def get_columns():

    return [

        {
            "label": "Sl. No.",
            "fieldname": "sr_no",
            "fieldtype": "Data",
            "width": 80
        },
        {
            "label": "Specification",
            "fieldname": "specification",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "label": "Unit",
            "fieldname": "unit",
            "fieldtype": "Data",
            "width": 120
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

    task_group = {}

    for row in boq_doc.boq_items:

        task = row.task or None
        item_type = row.item_type or None

        if task not in task_group:
            task_group[task] = {}

        if item_type not in task_group[task]:
            task_group[task][item_type] = []

        task_group[task][item_type].append(row)

    for task, item_types in task_group.items():

        task_doc = frappe.get_doc("Task", task)

        data.append({
            "sr_no": "",
            "specification": f"TASK : {task}",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None,
            "bold": 1
        })

        data.append({
            "sr_no": "",
            "specification": f"Subject : {task_doc.subject or ''}",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": None
        })


        data.append({
            "sr_no": "",
            "specification": f"Description : {strip_html(task_doc.description or '')}",
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

        task_total = 0

        ordered_types = ["Man", "Material", "Equipment"]

        for item_type in ordered_types:

            rows = item_types.get(item_type, [])

            if not rows:
                continue

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
            item_type_qty_total = 0

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
                item_type_qty_total += row.quantity or 0
                task_total += row.amount or 0

                sr_no += 1

            data.append({
                "sr_no": "",
                "specification": f"Total",
                "unit": "",
                "qty": item_type_qty_total,
                "rate": None,
                "amount": item_type_total,
                "bold": 1
            })

            data.append({
                "sr_no": "",
                "specification": "",
                "unit": "",
                "qty": None,
                "rate": None,
                "amount": None
            })

        # Task Grand Total
        data.append({
            "sr_no": "",
            "specification": f"{task} Grand Total",
            "unit": "",
            "qty": None,
            "rate": None,
            "amount": task_total,
            "bold": 1
        })

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