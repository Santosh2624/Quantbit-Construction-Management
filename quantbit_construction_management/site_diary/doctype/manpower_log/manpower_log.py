# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ManpowerLog(Document):

	def validate(self):

		self.calculate_total()
		self.validate_hours_range()


	def calculate_total(self):

		self.total = (
			(self.skilled or 0)
			+ (self.unskilled or 0)
			+ (self.supervisors or 0)
		)


	def validate_hours_range(self):
		
		hours = (self.hours_worked + self.overtime_hours) or 8

		if hours < 0 or hours > 16:
			frappe.throw("Hours worked must be between 0 and 16")