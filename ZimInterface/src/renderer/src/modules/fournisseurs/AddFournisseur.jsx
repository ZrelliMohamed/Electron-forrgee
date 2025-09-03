export default function AddFournisseur() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Ajouter un fournisseur</h1>
      <form className="space-y-3 mt-4">
        <input className="border rounded-xl p-3 w-full" placeholder="Nom du fournisseur" />
        <input className="border rounded-xl p-3 w-full" placeholder="Email" />
        <input className="border rounded-xl p-3 w-full" placeholder="Téléphone" />
        <button className="px-5 py-3 rounded-2xl bg-brand-500 text-white">Enregistrer</button>
      </form>
    </div>
  );
}