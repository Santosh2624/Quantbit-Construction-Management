# Copyright (c) 2026, QTPL and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today
import random


class SiteDiary(Document):

	def before_insert(self):
		if not self.diary_no:
			self.diary_no = self.generate_unique_diary_number()

	def validate(self):
		self.validate_unique_diary()
		self.validate_project_date_range()
		self.validate_stoppage_reason()
		self.calculate_contract_day_number()
		self.validate_temperature_range()

	def before_submit(self):
		self.validate_future_date()


	def validate_unique_diary(self):

		existing = frappe.db.exists(
			"Site Diary",
			{
				"project": self.project,
				"site_date": self.site_date,
				"name": ["!=", self.name]
			}
		)

		if existing:
			frappe.throw(
				f"Diary already exists for project {self.project} on {self.site_date}"
			)


	def validate_project_date_range(self):

		if not self.project or not self.site_date:
			return

		start_date, end_date = frappe.db.get_value(
			"Project",
			self.project,
			["expected_start_date", "expected_end_date"]
		)

		site_date = getdate(self.site_date)

		if start_date and site_date < getdate(start_date):
			frappe.throw("Diary date cannot be before project start date")

		if end_date and site_date > getdate(end_date):
			frappe.throw("Diary date cannot be after project end date")


	def validate_stoppage_reason(self):

		if self.work_stopped and not self.stoppage_reason:
			frappe.throw("Please provide stoppage reason when work is stopped")


	def validate_future_date(self):

		if getdate(self.site_date) > getdate(today()):
			frappe.throw("Diary date cannot be in the future")


	def calculate_contract_day_number(self):

		start_date = frappe.db.get_value(
			"Project",
			self.project,
			"expected_start_date"
		)

		if start_date:
			self.day_no_of_contract = (
				getdate(self.site_date) - getdate(start_date)
			).days + 1
			

	def validate_temperature_range(self):

		if self.min_temp and self.max_temp:

			if self.min_temp > self.max_temp:
				frappe.throw("Min temperature cannot exceed max temperature")

	
	def generate_unique_diary_number(self):

		while True:

			number = str(random.randint(10000, 99999))

			exists = frappe.db.exists(
				"Site Diary",
				{"diary_no": number}
			)

			if not exists:
				return number