# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SiteEquipmentLog(Document):

    def validate(self):

        self.validate_supplier_required()
        self.validate_shift_hours_limit()


    def validate_supplier_required(self):

        if self.owner == "Hired" and not self.supplier:
            frappe.throw("Please select Hire Supplier for hired equipment")


    def validate_shift_hours_limit(self):

        total_hours = (
            (self.hours_working or 0)
            + (self.hours_idle or 0)
            + (self.hours_breakdown or 0)
        )

        if total_hours > 24:
            frappe.throw(
                "Working + Idle + Breakdown hours cannot exceed shift duration"
            )