export const dynamic = 'force-static';

export default function OfferwallPage() {
	return (
		<div className="max-w-3xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Earn to Unlock</h1>
			<p className="text-slate-700 mb-4">
				Complete offers to fund your project. When the network confirms your completions, your
				progress will update automatically.
			</p>
			<div className="rounded-lg border p-4">
				<p className="text-sm text-slate-600">
					Integrate your preferred offerwall provider here (ayeT-Studios, AdGate, etc.). For now,
					set up your provider to credit callbacks to:
				</p>
				<pre className="mt-3 rounded bg-slate-50 p-3 text-xs overflow-auto">
					{`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/offerwall/callback`}
				</pre>
			</div>
		</div>
	);
}


