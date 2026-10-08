namespace MauiApp1;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
    }

    // Clic sur un élément du menu latéral. Le CommandParameter indique la page demandée.
    private async void OnMenuTapped(object? sender, TappedEventArgs e)
    {
        var page = e.Parameter as string;
        await DisplayAlert("Menu", $"Page : {page}", "OK");
    }
}
