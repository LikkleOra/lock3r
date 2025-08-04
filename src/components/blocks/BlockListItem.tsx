'use client';

import React, { useState } from 'react';
import { BlockItem } from '@/models';
import { formatDate } from '@/lib/utils';

interface BlockListItemProps {
  item: BlockItem;
  onRemove: (id: string) => void;
  onTogglePermanent: (id: string) => void;
}

export function BlockListItem({ 
  item, 
  onRemove, 
  onTogglePermanent
}: BlockListItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    if (showConfirm) {
      onRemove(item.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="p-4 hover:bg
}iv>
  );  </dv>
      </di  </div>
   )}
         ton>
      /but  <      Remove
                  >
      rs"
      on-coloitinse/10 tra-destructivhover:bg rounded-md ive/20uctorder-destrr bordeve bctit-destruexext-sm t1 t3 py-="px-  className          ve}
  emoick={handleR       onCl        <button
            ) : (
   iv>
            </d      ton>
  </but       ncel
               Ca  >
                  bg-muted"
d hover:nded-morder rout-sm b py-1 texName="px-3     class           
irm(false)}nf=> setShowCo) ={(icknCl   o     
           <button          tton>
         </buirm
      nf    Co      >
                  ive/90"
  ct:bg-destrued-md hover roundregroundctive-fotext-destrue destructivsm bg-y-1 text- px-3ssName="p       cla
         leRemove}nClick={hand       o
          <button          
   ap-2">="flex gassName<div cl           ? (
 wConfirm ho  {s      
        
    button></
          Permanent'}e ary' : 'MakMake Temporent ? 'em.isPerman   {it        >
     rs"
      losition-comuted tranover:bg-ded-md her roun bordxt-smpx-3 py-1 teme=" classNa     d)}
      t(item.ilePermanen => onToggnClick={()      o       <button
        -4">
 p-2 ml gaems-centerx itssName="flediv cla
        <</div>
           )}
 v>
             </di   
  span>     </       gory}
    {item.cate          
    00">-blue-8extlue-100 t-btext-xs bgunded-full -2 py-1 ror pxte-cenx itemsflenline-lassName="in c    <spa     >
     "e="mt-2amssN<div cla    
        gory && (  {item.cate      iv>

     </d       
)}        span>
    ssed))}</lastAcceem.(new Date(itformatDatet accessed {pan>Las <s        
     & (Accessed &{item.last            pan>
t))}</sm.createdAew Date(iteDate(n {formatspan>Added   <
         round">regext-muted-fo-1 text-sm tp-4 mtgatems-center e="flex iiv classNam <d
               v>
      </di           )}
        >
    </span       
    nent    Perma      ">
      800nge-100 text-oram bg-orange-s font-mediul text-xounded-fulx-2 py-1 rer ps-cent itemne-flex"inli=amespan classN        <& (
      anent &sPermtem.i         {i   .url}</h4>
itemuncate">{m triue="font-medclassNam <h4            ">
-2ter gapx items-cenleme="fassNa    <div cl     
 -w-0"> miname="flex-1 classN     <div">
   tweenbe justify--centerflex itemslassName="div c      <">
n-colorssitio tranuted/50-m