export default function ArticleMovement() {
return (
<div className="space-y-6">
<h1 className="text-2xl font-semibold">Mouvement article</h1>
<p className="text-slate-600">Entrées / Sorties / Transferts…</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<select className="border rounded-xl p-3">
<option>Entrée</option>
<option>Sortie</option>
<option>Retour</option>
</select>
<input className="border rounded-xl p-3" placeholder="Référence article" />
<input className="border rounded-xl p-3" placeholder="Quantité" type="number" />
</div>
<button className="px-5 py-3 rounded-2xl bg-brand-500 text-white">Valider</button>
</div>
);
}