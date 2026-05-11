frappe.ui.form.on("Opportunity", {
	setup: function (frm) {

		frm.set_query("opportunity_from", function () {
			return {
				filters: {
					name: ["in", ["Customer", "Lead"]],
				},
			};
		});
    }
})