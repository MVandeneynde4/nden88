using MauiApp1.Views;

namespace MauiApp1;

public partial class MainPage : ContentPage
{
    private static readonly Color ActiveMenuColor = Color.FromArgb("#0F766E");

    // Les pages sont créées une seule fois et réutilisées.
    private readonly DashboardView _dashboard = new();
    private VentesView? _ventes;

    private bool _isSidebarExpanded = true;

    public MainPage()
    {
        InitializeComponent();
        ContentHost.Content = _dashboard;
    }

    // Lu par les bindings du menu : masque les textes quand le menu est replié.
    public bool IsSidebarExpanded
    {
        get => _isSidebarExpanded;
        set
        {
            if (_isSidebarExpanded == value)
                return;
            _isSidebarExpanded = value;
            OnPropertyChanged();
        }
    }

    private void OnCollapseClicked(object? sender, EventArgs e)
    {
        IsSidebarExpanded = !IsSidebarExpanded;

        SidebarPanel.WidthRequest = IsSidebarExpanded ? 238 : 76;
        SidebarPanel.Padding = IsSidebarExpanded ? new Thickness(16, 22) : new Thickness(10, 22);
        CollapseButton.Text = IsSidebarExpanded ? "«" : "»";
        ToolTipProperties.SetText(CollapseButton, IsSidebarExpanded ? "Replier le menu" : "Déplier le menu");
    }

    private async void OnMenuTapped(object? sender, TappedEventArgs e)
    {
        var key = e.Parameter as string;

        switch (key)
        {
            case "dashboard":
                ShowPage(_dashboard, "Tableau de bord", "Situation financière et activité de la pharmacie");
                break;
            case "ventes":
                _ventes ??= new VentesView();
                ShowPage(_ventes, "Ventes & Comptoir", "Catalogue des articles vendus au comptoir");
                break;
            default:
                await DisplayAlertAsync(key, "Cette page n'est pas encore disponible dans la démonstration.", "OK");
                return;
        }

        HighlightMenu(sender as Border);
    }

    private void ShowPage(View page, string title, string subtitle)
    {
        ContentHost.Content = page;
        PageTitle.Text = title;
        PageSubtitle.Text = subtitle;
    }

    private void HighlightMenu(Border? selected)
    {
        foreach (var item in MenuList.Children.OfType<Border>())
            item.BackgroundColor = item == selected ? ActiveMenuColor : Colors.Transparent;
    }
}
