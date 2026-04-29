# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SiteMaterialDelivery(Document):

    def validate(self):

        self.validate_rejection_reason()


    def validate_rejection_reason(self):

        if not self.accepted and not self.rejection_reason:
            frappe.throw(
                "Please provide rejection reason for unaccepted material"
            )