namespace MauiApp1.Views;

public partial class VentesView : ContentView
{
    private static readonly Color EvenRow = Colors.White;
    private static readonly Color OddRow = Color.FromArgb("#FAFCFD");

    private readonly ColumnSettings _cols = new();
    private readonly List<Produit> _all;
    private readonly Dictionary<string, (Label Header, string Title)> _headers;

    private string _sortKey = "Code";
    private bool _sortAscending = true;
    private int _page = 1;
    private int _pageSize = 10;
    private int _pageCount = 1;

    public VentesView()
    {
        InitializeComponent();

        BindingContext = _cols;
        _all = Produit.CreateDemo(_cols);
        _headers = new()
        {
            ["Code"] = (HdrCode, "CODE"),
            ["Nom"] = (HdrNom, "DÉSIGNATION"),
            ["Categorie"] = (HdrCategorie, "CATÉGORIE"),
            ["Prix"] = (HdrPrix, "PRIX TTC"),
            ["Stock"] = (HdrStock, "STOCK"),
            ["Actif"] = (HdrActif, "ACTIF"),
            ["Remboursable"] = (HdrRemboursable, "REMBOURSABLE"),
        };

        PageSizePicker.SelectedIndex = 1; // 10 lignes ; déclenche aussi le premier affichage.
    }

    // Filtre, trie et découpe la liste, puis affiche la page courante.
    private void Refresh()
    {
        var search = SearchEntry.Text?.Trim() ?? "";
        IEnumerable<Produit> rows = _all;

        if (search.Length > 0)
        {
            rows = rows.Where(p =>
                p.Code.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Nom.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Categorie.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        Func<Produit, object> key = _sortKey switch
        {
            "Nom" => p => p.Nom,
            "Categorie" => p => p.Categorie,
            "Prix" => p => p.Prix,
            "Stock" => p => p.Stock,
            "Actif" => p => p.Actif,
            "Remboursable" => p => p.Remboursable,
            _ => p => p.Code,
        };
        rows = _sortAscending ? rows.OrderBy(key) : rows.OrderByDescending(key);

        var filtered = rows.ToList();
        _pageCount = Math.Max(1, (int)Math.Ceiling(filtered.Count / (double)_pageSize));
        _page = Math.Clamp(_page, 1, _pageCount);

        var pageRows = filtered.Skip((_page - 1) * _pageSize).Take(_pageSize).ToList();
        for (var i = 0; i < pageRows.Count; i++)
            pageRows[i].RowColor = i % 2 == 0 ? EvenRow : OddRow;

        BindableLayout.SetItemsSource(RowsHost, pageRows);
        EmptyLabel.IsVisible = filtered.Count == 0;

        var from = filtered.Count == 0 ? 0 : (_page - 1) * _pageSize + 1;
        var to = (_page - 1) * _pageSize + pageRows.Count;
        CountLabel.Text = $"Affichage {from}–{to} sur {filtered.Count} articles"
                        + (search.Length > 0 ? $" (filtrés sur {_all.Count})" : "");
        PageLabel.Text = $"Page {_page} / {_pageCount}";

        FirstButton.IsEnabled = PrevButton.IsEnabled = _page > 1;
        NextButton.IsEnabled = LastButton.IsEnabled = _page < _pageCount;

        foreach (var (name, (header, title)) in _headers)
            header.Text = name == _sortKey ? $"{title} {(_sortAscending ? "▲" : "▼")}" : title;
    }

    private void OnSearchChanged(object? sender, TextChangedEventArgs e)
    {
        _page = 1;
        Refresh();
    }

    private void OnSortTapped(object? sender, TappedEventArgs e)
    {
        var key = (string)e.Parameter!;
        if (key == _sortKey)
            _sortAscending = !_sortAscending;
        else
        {
            _sortKey = key;
            _sortAscending = true;
        }
        Refresh();
    }

    private void OnPageSizeChanged(object? sender, EventArgs e)
    {
        if (PageSizePicker.SelectedItem is string size)
        {
            _pageSize = int.Parse(size);
            _page = 1;
            Refresh();
        }
    }

    private void OnColumnsClicked(object? sender, EventArgs e)
    {
        ColumnsPanel.IsVisible = !ColumnsPanel.IsVisible;
        ColumnsButton.Text = ColumnsPanel.IsVisible ? "▥  Colonnes ▴" : "▥  Colonnes ▾";
    }

    private void OnFirstClicked(object? sender, EventArgs e) { _page = 1; Refresh(); }
    private void OnPrevClicked(object? sender, EventArgs e) { _page--; Refresh(); }
    private void OnNextClicked(object? sender, EventArgs e) { _page++; Refresh(); }
    private void OnLastClicked(object? sender, EventArgs e) { _page = _pageCount; Refresh(); }
}
