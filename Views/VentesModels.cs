using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MauiApp1.Views;

public abstract class ObservableObject : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    protected void Set<T>(ref T field, T value, [CallerMemberName] string? name = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
            return;
        field = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}

// Colonnes affichées dans le tableau (cochées dans la liste « Colonnes »).
public class ColumnSettings : ObservableObject
{
    private bool _showCode = true, _showNom = true, _showCategorie = true, _showPrix = true,
                 _showStock = true, _showActif = true, _showRemboursable = true;

    public bool ShowCode { get => _showCode; set => Set(ref _showCode, value); }
    public bool ShowNom { get => _showNom; set => Set(ref _showNom, value); }
    public bool ShowCategorie { get => _showCategorie; set => Set(ref _showCategorie, value); }
    public bool ShowPrix { get => _showPrix; set => Set(ref _showPrix, value); }
    public bool ShowStock { get => _showStock; set => Set(ref _showStock, value); }
    public bool ShowActif { get => _showActif; set => Set(ref _showActif, value); }
    public bool ShowRemboursable { get => _showRemboursable; set => Set(ref _showRemboursable, value); }
}

public class Produit : ObservableObject
{
    private bool _actif;
    private bool _remboursable;
    private Color _rowColor = Colors.White;

    public required string Code { get; init; }
    public required string Nom { get; init; }
    public required string Categorie { get; init; }
    public decimal Prix { get; init; }
    public int Stock { get; init; }

    // Chaque ligne garde une référence aux réglages de colonnes pour ses bindings.
    public required ColumnSettings Cols { get; init; }

    public bool Actif { get => _actif; set => Set(ref _actif, value); }
    public bool Remboursable { get => _remboursable; set => Set(ref _remboursable, value); }
    public Color RowColor { get => _rowColor; set => Set(ref _rowColor, value); }

    public string PrixText => $"{Prix:N2} DH";

    public Color StockColor => Stock == 0 ? Color.FromArgb("#E11D48")
                             : Stock < 20 ? Color.FromArgb("#D97706")
                             : Color.FromArgb("#059669");

    public Color StockBackground => Stock == 0 ? Color.FromArgb("#FFF1F2")
                                  : Stock < 20 ? Color.FromArgb("#FFFBEB")
                                  : Color.FromArgb("#ECFDF5");

    // Données fictives pour la démonstration.
    public static List<Produit> CreateDemo(ColumnSettings cols)
    {
        (string Nom, string Categorie)[] bases =
        [
            ("Doliprane 1000 mg", "Pharmacie"), ("Efferalgan 1 g", "Pharmacie"), ("Spasfon", "Pharmacie"),
            ("Smecta", "Pharmacie"), ("Augmentin 1 g", "Pharmacie"), ("Amoxicilline 500 mg", "Pharmacie"),
            ("Vitamine C 1000", "Diététique"), ("Magnésium B6", "Diététique"), ("Oméga 3", "Diététique"),
            ("Protéine whey", "Diététique"), ("Crème hydratante", "Parapharmacie"), ("Écran solaire SPF50", "Parapharmacie"),
            ("Shampooing doux", "Parapharmacie"), ("Dentifrice soin", "Parapharmacie"), ("Gel hydroalcoolique", "Parapharmacie"),
        ];
        string[] formats = ["B/8", "B/16", "B/30"];

        var random = new Random(42);
        var list = new List<Produit>();
        var n = 1;
        foreach (var (nom, categorie) in bases)
        {
            foreach (var format in formats)
            {
                list.Add(new Produit
                {
                    Code = $"ART-{n++:000}",
                    Nom = $"{nom} {format}",
                    Categorie = categorie,
                    Prix = Math.Round((decimal)(random.NextDouble() * 180 + 8), 2),
                    Stock = random.Next(0, 8) == 0 ? 0 : random.Next(1, 150),
                    Actif = random.Next(0, 5) != 0,
                    Remboursable = categorie == "Pharmacie" && random.Next(0, 3) != 0,
                    Cols = cols,
                });
            }
        }
        return list;
    }
}
