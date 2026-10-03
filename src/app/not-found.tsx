import { EnTete, LienBouton } from "@/components/ui";

export default function PageIntrouvable() {
  return (
    <div className="py-16 text-center">
      <EnTete titre="Page introuvable" sousTitre="L'élément demandé n'existe pas ou a été supprimé." />
      <LienBouton href="/">Retour au tableau de bord</LienBouton>
    </div>
  );
}
