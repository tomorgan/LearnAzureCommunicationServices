using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Azure;
using Azure.Communication;
using Azure.Communication.Identity;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation("Creating an ACS Identity.");
    CommunicationIdentityClient client = new CommunicationIdentityClient(Environment.GetEnvironmentVariable("ACS_Connection_String"));
    var createUserResponse = await client.CreateUserAsync();
    var user = createUserResponse.Value;

    log.LogInformation("Issuing Access Token");
    var tokenResponse = await client.IssueTokenAsync(user, scopes: new[] { CommunicationTokenScope.VoIP, CommunicationTokenScope.Chat });
    return new OkObjectResult(tokenResponse.Value);
}

