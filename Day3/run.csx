using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Azure;
using Azure.Communication;
using Azure.Communication.Identity;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation("Creating an ACS Identity and issuing token");
    CommunicationIdentityClient client = new CommunicationIdentityClient(Environment.GetEnvironmentVariable("ACS_Connection_String"));
    
    var tokenResponse = await client.CreateUserWithTokenAsync(scopes: new[] { CommunicationTokenScope.VoIP, CommunicationTokenScope.Chat });
    return new OkObjectResult(tokenResponse);
}

