import React from "react";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Legend,
} from "recharts";

export type PollResult = {
	option: string;
	votes: number;
};

export type PollResultsChartProps = {
	data: PollResult[];
	type?: "pie" | "bar";
};

const COLORS = [
	"#6366f1",
	"#a78bfa",
	"#f472b6",
	"#34d399",
	"#fbbf24",
	"#60a5fa",
	"#f87171",
	"#facc15",
];

export function PollResultsChart({
	data,
	type = "pie",
}: PollResultsChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className="text-center text-gray-500">No results to display.</div>
		);
	}

	return (
		<div className="w-full h-72">
			<ResponsiveContainer width="100%" height="100%">
				{type === "pie" ? (
					<PieChart>
						<Pie
							data={data}
							dataKey="votes"
							nameKey="option"
							cx="50%"
							cy="50%"
							outerRadius={80}
							label
						>
							{data.map((entry, idx) => (
								<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
							))}
						</Pie>
						<Tooltip />
						<Legend />
					</PieChart>
				) : (
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
					>
						<XAxis dataKey="option" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Legend />
						<Bar dataKey="votes" fill="#6366f1" />
					</BarChart>
				)}
			</ResponsiveContainer>
		</div>
	);
}
