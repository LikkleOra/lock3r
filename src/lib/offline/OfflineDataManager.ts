// Offline data persistence and synchronization for FocusGuardian
import { getCurrentTimestamp, generateId } from '@/lib/utils';

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'focus_session' | 'block_item' | 'challenge_attempt';
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingOperations: number;
  syncInProgress: boolean;
  lastError?: string;
}

export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private syncStatus: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: 0,
    pendingOperations: 0,
    syncInProgress: false
  };
  private syncListeners: Array<(status: SyncStatus) => void> = [];
  private maxRetries = 3;

  private constructor() {
    this.initializeOfflineSupport();
  }

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  private initializeOfflineSupport(): void {
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });

    // Load pending operations count
    this.updatePendingOperationsCount();
  }

  privatetance();nager.getInstaMaDa= Offliner ManagetaDanst offlineco}

export 
  }
   });
 ons(dingOperatiyncPenawait this.s {
      Online).isStatusyncs.s(thi if 
   void> {mise<nc(): Pro forcSysyncnc
  aForce sy // 

 }
    }
  ); errora:',line datclear off to or('Failedonsole.err
      c) {catch (error();
    } nsCounterationgOpPenditeis.upda      thions');
ratline_ope'fg_offveItem(torage.remo localStry {
     
    : void {()flineDataOf  clearine data
flall of Clear 
  }

  //tus };ncSta...this.syeturn {    r {
 tus: SyncStatus()cSta  getSynus
sync statrrent // Get cu}

  
    };
        }ndex, 1);
.splice(iListenersthis.sync         > -1) {
exnd if (i   er);
  enlistindexOf(rs.yncListenehis.st index = t    cons) => {
  n (
    returction funbscribeunsuturn // Re
    
    );sh(listenerers.pustenLi   this.sync=> void {
 id): () => voStatus) ynctatus: Sistener: (s(lSyncListeneradder
  istentatus lync s
  // Add s
;
  }type}`)eration.opity}: ${n.enttio${operag(`Synced le.lo  conso 100));
  e,eout(resolv setTimsolve =>e(rePromisait new    awPI call
 imulate A
    // Sd> {oi: Promise<vation)eOperion: Offlinerattion(opcSingleOperanc syn private asy)
 onI integratir APeholder folacperation (p a single o// Sync  }

  
    }
    });d'
  'Sync faileessage : error.mf Error ? anceo insterrorError:     last    false, 
rogress:    syncInP   ({ 
  ncStatusateSyis.upd th);
      errorled:',r('Sync faisole.erro{
      conh (error)  catc
    }Count();
OperationsPendingteis.upda      th
   });tamp()
   rrentTimese: getCutSyncTim   las 
     ess: false,cInProgryn 
        scStatus({eSyn.updatisth           
ns));
 y(operatiostringifN.JSOtions', eraffline_op'fg_oem(.setItStorage    localons
  eratiopted  Save upda    //
  }
      }
       
 +;.retryCount+ation       operror);
   id}:`, erration.tion ${operaopeed to sync rror(`Fail console.e    r) {
     rocatch (er }       = true;
  cedration.syn  ope
        );ationerion(opgleOperatsyncSinthis.it   awa         {
     tryps) {
   of pendingOn atioopert   for (cons}

    
      urn;        ret });
   ns: 0 
    perationdingO    pe    stamp(),
  ntTimeCurreTime: getnctSy        las, 
  ss: falsesyncInProgre        ({ 
  tusateSyncStaupd this.  ) {
     gth === 0ps.lenif (pendingO    
  s);
axRetriet < this.mtryCouned && op.re => !op.synclter(opions.fiOps = operatnst pending
      co;ns()tioradingOpeis.getPenrations = th const ope
     

    try {d });: undefinee, lastErrorress: tru{ syncInProgus(SyncStat.update
    this
;
    }   returnress) {
   syncInProgus.his.syncStat tsOnline ||yncStatus.iif (!this.s   e<void> {
 omisons(): PrraticPendingOpesyns
  async g operationndin all pe
  // Sync}
ount });
  ndingCtions: pengOperapenditatus({ cS.updateSyn
    this).length;ed> !op.syncter(op =ns.filt = operatioendingCoun  const pions();
  eratPendingOpetons = this.goperatist d {
    con voinsCount():ratioingOpeatePende upd
  privatcountrations  opengendidate p/ Up }

  / }
    turn [];
  re    r);
ns:', erroratioending oped to load pleai('Fonsole.error      cr) {
catch (erro
    } tored) : [];N.parse(sSOstored ? Jreturn   s');
    ationoperne_offli'fg_age.getItem(alStor locnst stored =  co
    ry {
    tration[] {ineOpeOffl: tions()eraingOpgetPendivate s
  prng operationndiall peet  G

  //  }
  }or);
  rrion:', eratne opeue offlio queailed tle.error('F    consoor) {
   catch (err
    }
      }0);), 10s(ingOperationyncPendhis.s> t() = setTimeout() {
       ogresssyncInPrtus.yncSta.sis!thOnline && yncStatus.is (this.se
      ifinately if onlmedi sync imto  // Try 
          sCount();
tiondingOperas.updatePen  thi   
      ;
 tions))ingify(operaON.strns', JSne_operatio_offli('fge.setItemragto    localS
  );ionOperatsh(full.punseratio  op   
 ations();dingOperetPenons = this.gonst operati    c
   try {

   
    };nt: 0    retryCoufalse,
     synced: p(),
   entTimestammp: getCurr timestad(),
     teI id: genera
     n,tio ...opera
     ration = {flineOpen: OfllOperatiot fu  consvoid {
  nt'>): tryCouced' | 'rep' | 'syn | 'timestamtion, 'id'OperaOmit<Offline: n(operationperatio queueO
 ine syncn for offltio operaeue an
  // Qu });
  }

         }', error);
nc listener:rror in syor('Eole.err    cons  error) {
   } catch (us);
     s.syncStatner(thi   liste {
         try> {
   =listenerers.forEach(yncListenhis.s {
    t(): voidListenersSynce notify privat  }

 s();
SyncListenerifythis.notes };
     ...updats,.syncStatu { ...thissyncStatus =
    this.s>): void {ncStatutial<Syupdates: Pars(cStatu updateSyn