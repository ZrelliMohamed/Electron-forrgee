export default function SettingsPage() {
return (
<div className="space-y-6">
<h1 className="text-2xl font-semibold">Paramètres</h1>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="rounded-2xl border p-4">
<h2 className="font-semibold mb-2">Thème</h2>
<button className="px-4 py-2 rounded-xl border">Clair</button>
</div>
<div className="rounded-2xl border p-4">
<h2 className="font-semibold mb-2">Langue</h2>
<select className="border rounded-xl p-2">
<option>Français</option>
<option>العربية</option>
<option>English</option>
</select>
</div>
</div>
</div>
);
}