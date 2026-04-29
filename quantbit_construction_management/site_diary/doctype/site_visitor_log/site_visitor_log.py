# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SiteVisitorLog(Document):

    def validate(self):

        self.validate_induction()
        self.validate_time_logic()


    def validate_induction(self):

        if not self.inducted:
            frappe.throw("Visitor must be safety inducted before entry")


    def validate_time_logic(self):

        if self.time_out and self.time_out <= self.time_in:
            frappe.throw("Time Out must be after Time In")