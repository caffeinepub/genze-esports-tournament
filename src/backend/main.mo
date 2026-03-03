import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import Nat32 "mo:core/Nat32";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Principal "mo:core/Principal";


actor {
  public type TournamentId = Nat32;

  type Tournament = {
    id : TournamentId;
    name : Text;
    date : Text;
    location : Text;
    slotsAvailable : Nat;
    slotsUsed : Nat;
  };

  type PlayerStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Player = {
    id : Nat32;
    name : Text;
    contact : Text;
    tournamentId : TournamentId;
    status : PlayerStatus;
  };

  type PaymentStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Payment = {
    id : Nat32;
    playerId : Nat32;
    screenshotData : Blob;
    screenshotMime : Text;
    timestamp : Time.Time;
    status : PaymentStatus;
  };

  let adminEmail = "genZeSports2026@gmail.com";
  let adminPassword = "GenZe@2026";
  let adminToken = "supersecrettoken";

  var nextTournamentId : Nat32 = 1;
  var nextPlayerId : Nat32 = 1;
  var nextPaymentId : Nat32 = 1;

  let tournaments = Map.empty<TournamentId, Tournament>();
  let players = Map.empty<Nat32, Player>();
  let payments = Map.empty<Nat32, Payment>();

  func validateAdminSession(token : Text) : async () {
    if (token != adminToken) {
      Runtime.trap("Invalid admin session token");
    };
  };

  public shared ({ caller }) func createTournament(token : Text, name : Text, date : Text, location : Text, slotsAvailable : Nat) : async TournamentId {
    await validateAdminSession(token);

    let id = nextTournamentId;
    nextTournamentId += 1;

    let tournament = {
      id;
      name;
      date;
      location;
      slotsAvailable;
      slotsUsed = 0;
    };

    tournaments.add(id, tournament);
    id;
  };

  public query ({ caller }) func getTournaments() : async [Tournament] {
    tournaments.values().toArray();
  };

  public query ({ caller }) func getTournament(id : TournamentId) : async ?Tournament {
    tournaments.get(id);
  };

  public shared ({ caller }) func deleteTournament(token : Text, id : TournamentId) : async () {
    await validateAdminSession(token);
    tournaments.remove(id);
  };

  public shared ({ caller }) func registerPlayer(name : Text, contact : Text, tournamentId : TournamentId) : async Nat32 {
    let tournament = switch (tournaments.get(tournamentId)) {
      case (?t) { t };
      case (null) { Runtime.trap("Tournament does not exist") };
    };

    if (tournament.slotsUsed >= tournament.slotsAvailable) {
      Runtime.trap("Tournament is full");
    };

    let player = {
      id = nextPlayerId;
      name;
      contact;
      tournamentId;
      status = #pending;
    };

    players.add(nextPlayerId, player);

    let updatedTournament = {
      tournament with
      slotsUsed = tournament.slotsUsed + 1;
    };
    tournaments.add(tournamentId, updatedTournament);

    let playerId = nextPlayerId;
    nextPlayerId += 1;
    playerId;
  };

  public query ({ caller }) func getPlayersByTournament(tournamentId : TournamentId) : async [Player] {
    players.values().toArray().filter(
      func(p) {
        p.tournamentId == tournamentId;
      }
    );
  };

  public shared ({ caller }) func updatePlayerStatus(token : Text, playerId : Nat32, status : PlayerStatus) : async () {
    await validateAdminSession(token);

    switch (players.get(playerId)) {
      case (null) {
        Runtime.trap("Player not found");
      };
      case (?player) {
        let updatedPlayer = {
          player with status;
        };
        players.add(playerId, updatedPlayer);
      };
    };
  };

  public shared ({ caller }) func submitPayment(playerId : Nat32, screenshotData : Blob, screenshotMime : Text) : async Nat32 {
    let payment = {
      id = nextPaymentId;
      playerId;
      screenshotData;
      screenshotMime;
      timestamp = Time.now();
      status = #pending;
    };

    payments.add(nextPaymentId, payment);

    let paymentId = nextPaymentId;
    nextPaymentId += 1;
    paymentId;
  };

  public shared ({ caller }) func updatePaymentStatus(token : Text, paymentId : Nat32, status : PaymentStatus) : async () {
    await validateAdminSession(token);

    switch (payments.get(paymentId)) {
      case (null) {
        Runtime.trap("Payment not found");
      };
      case (?payment) {
        let updatedPayment = {
          payment with status;
        };
        payments.add(paymentId, updatedPayment);
      };
    };
  };

  public query ({ caller }) func getPaymentsByPlayer(playerId : Nat32) : async [Payment] {
    payments.values().toArray().filter(
      func(p) {
        p.playerId == playerId;
      }
    );
  };

  public shared ({ caller }) func authenticateAdmin(email : Text, password : Text) : async Text {
    if (email != adminEmail or password != adminPassword) {
      Runtime.trap("Invalid admin credentials");
    };
    adminToken;
  };

  public query ({ caller }) func getPaymentPaymentCount() : async Nat {
    payments.size();
  };
};
