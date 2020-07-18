

$(document).on('turbolinks:load',function(){
  //写真の複数投稿機能
  $('#input-img').on('change',function(e){
    // 画像が選択された時プレビュー表示、inputの親要素のdivをイベント元に指定

    //ファイルオブジェクトを取得する
    let files = e.target.files;
    $.each(files, function(index,file){
      let reader = new FileReader(); 

      //画像でない場合は処理終了
      if(file.type.indexOf("image") < 0){
        alert("画像ファイルを指定してください。");
        return false;
      };

      //アップロードした画像を設定する
      reader.onload = (function(file){
        return function(e){
          let imageLength = $('#output-box').children('li').length;
          // 表示されているプレビューの数を数える

          let labelLength = $("#input-img>label").eq(-1).data('label-id');

          $('#input-img').before(`<li class="preview-image" id="upload-image${labelLength}" data-image-id="${labelLength}">
                                      <figure class="preview-image__figure">
                                        <img src='${e.target.result}' title='${file.name}' >
                                      </figure>
                                      <div class="preview-image__button">
                                        <a href="" class="preview-image__button__delete" data-image-id="${labelLength}">削除</a>
                                      </div>
                                    </li>`);
          $("#input-img>label").eq(-1).css('display','none');
          // 入力されたlabelを見えなくする

          if (imageLength < 9) {
            // 表示されているプレビューが９以下なら、新たにinputを生成する
            $("#input-img").append(`<label for="input-images${labelLength+1}" class="input-label" data-label-id="${labelLength+1}">
                                        <input multiple="multiple" class="input-function" id="input-images${labelLength+1}" style="display: none;" type="file" >
                                        <img class="logo_camera" src="/assets/icon_camera-24c5a3dec3f777b383180b053077a49d0416a4137a1c541d7dd3f5ce93194dee.png">
                                        <p class="input-text">
                                          ドラックアンドドロップ
                                          またはクリックしてファイルをダウンロード
                                        </p>
                                      </label>`);
          };
        };
      })(file);
      reader.readAsDataURL(file);
    });
  });


  $(document).on("click","preview-image__button__delete",function(){
    let targetImageId = $(this).data('image-id');

    $(`#upload-image${targetImageId}`).remove();

    $(`[for=input_images${targetImageId}]`).remove();

    let imageLength = $('#output-box').children('li').length;
    if (imageLength < 9) {
      let labelLength = $("#input-img>label").eq(-1).data('label-id');
      // 表示されているプレビューが９以下なら、新たにinputを生成する
      $("#input-img").append(`<label for="input-images${labelLength+1}" class="input-label" data-label-id="${labelLength+1}">
                                  <input multiple="multiple" class="input-function" id="input-images${labelLength+1}" style="display: none;" type="file" >
                                  <img class="logo_camera" src="/assets/icon_camera-24c5a3dec3f777b383180b053077a49d0416a4137a1c541d7dd3f5ce93194dee.png">
                                  <p class="input-text">
                                    ドラックアンドドロップ
                                    またはクリックしてファイルをダウンロード
                                  </p>
                                </label>`);
    };
  });


  //商品の説明の文字カウント機能

  $('.input-sentences').keyup(function(){
    var count =$(this).val().length;
    $('.count').text(count);
  });




  //カテゴリーの選択機能
  $(function(){
    function appendOption(category){
      var html = `<option value="${category.id}" data-category="${category.id}">${category.name}</option>`;
      return html;
    }
  
    function appendChidrenBox(insertHTML){
      var childSelectHtml = '';
      childSelectHtml = `<select class="main_select-wrapper__box--select" id="child_category" name="product[category_id]">
                          <option value="---">---</option>
                          ${insertHTML}
                        </select>`;
      $('.main_select-wrapper__box').append(childSelectHtml);
    }
    function appendGrandchidrenBox(insertHTML){
      var grandchildSelectHtml = '';
      grandchildSelectHtml = `<select class="main_select-wrapper__box--select" id="grand_child_category" name="product[category_id]">
                                <option value="---">---</option>
                                ${insertHTML}
                              </select>`;
      $('.main_select-wrapper__box').append(grandchildSelectHtml);
    }
    $('#parent_category').on('change', function(){
      var parentCategory = document.getElementById('parent_category').value; 
      if (parentCategory != "---"){
        $.ajax({
          url: 'get_category_children',
          type: 'GET',
          data: { parent_name: parentCategory },
          dataType: 'json'
        })
        .done(function(children){
          $('#child_category').remove();
          $('#grand_child_category').remove();
          $('#size_wrapper').remove();
          $('#brand_wrapper').remove();
          var insertHTML = '';
          children.forEach(function(child){
            insertHTML += appendOption(child);
          });
          appendChidrenBox(insertHTML);
        })
        .fail(function(){
          alert('カテゴリー取得に失敗しました');
        })
      }else{
        $('#child_category').remove();
        $('#grand_child_category').remove();
        $('#size_wrapper').remove();
        $('#brand_wrapper').remove();
      }
    });
    $('.main_details__category').on('change', '#child_category', function(){
      var childId = $('#child_category option:selected').data('category');
      if (childId != "---"){ 
        $.ajax({
          url: 'get_category_grand_children',
          type: 'GET',
          data: { child_id: childId },
          dataType: 'json'
        })
        .done(function(grandchildren){
          if (grandchildren.length != 0) {
            $('#grand_child_category').remove();
            $('#size_wrapper').remove();
            $('#brand_wrapper').remove();
            var insertHTML = '';
            grandchildren.forEach(function(grandchild){
              insertHTML += appendOption(grandchild);
            });
            appendGrandchidrenBox(insertHTML);
          }
        })
        .fail(function(){
          alert('カテゴリー取得に失敗しました');
        })
      }else{
        $('#rand_child_category').remove(); 
        $('#brand_wrapper').remove();
      }
    });
  });

  //販売手数料と利益の計算機能
  $('#price').keyup(function(){
    let price = $(this).val();
    if(price >= 300 && price <=9999999){
      let fee = Math.floor(price * 0.1);
      // 小数点以下切り捨て
      let profit = (price - fee);
      $('#fee-value').text('¥'+fee.toLocaleString());
      // 対象要素の文字列書き換える
      $('#profit-value').text('¥'+profit.toLocaleString());
    } else {
      $('#fee-value').html('ー');
      $('#profit-value').html('ー');
    }
  });
  
  // 各フォームの入力チェック・エラーハンドリング
  $(function(){
  //画像
    $('#input-img').on('focus',function(){
      $('#error-image').text('');
      $('#input-img').on('blur',function(){
        $('#error-image').text('');
        let imageLength = $('#output-box').children('li').length;
        if(imageLength==''){
          $('#error-image').text('画像がありません');
        }else if(imageLength >10){
          $('#error-image').text('画像を10枚以下にして下さい');
        }else{
          $('#error-image').text('');
        }
      });
    });
  });

  //送信しようとした時
  $('form').on('submit',function(){
    let imageLength = $('#output-box').children('li').length;
    if(imageLength == ''){
      $('#error-image').text('画像がありません');
    }else if(imageLength >10){
      $('#error-image').text('画像を10枚以下にして下さい');
    }else{
      $('#error-image').text('');
    }
  });

  //商品名
  $('.input-name').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-name').text('入力してください');
      $(this).css('border-color','red');
    }else{
      $('#error-name').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

  //商品説明
  $('.input-sentences').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-text').text('入力してください');
      $(this).css('border-color','red');
    }else{
      $('#error-text').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

   //カテゴリーのエラーハンドリング
   function categoryError(categorySelect){
    let value = $(categorySelect).val();
    if(value == ""){
      $('#error-category').text('選択して下さい');
      $(categorySelect).css('border-color','red');
    }else{
      $('#error-category').text('');
      $(categorySelect).css('border-color','rgb(204, 204, 204)');
    }
  };
  //親カテゴリー
  $('#parent_category').on('blur',function(){
    categoryError('#parent_category')
  });
  //子カテゴリー
  $('.main_details__category').on('blur', '#child_category', function(){
    categoryError('#child_category')
  });
  //孫カテゴリー
  $('.main_details__category').on('blur', '#grand_child_category', function(){
    categoryError('#grand_child_category')
  });
  
  //状態
  $('#product_size').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-size').text('選択して下さい');
      $(this).css('border-color','red');
    }else{
      $('#error-size').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
    });

  //状態
  $('#product_product_condition').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-condition').text('選択して下さい');
      $(this).css('border-color','red');
    }else{
      $('#error-condition').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

  //送料負担
  $('#product_delivery_fee_id').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-deliverycost').text('選択して下さい');
      $(this).css('border-color','red');
    }else{
      $('#error-deliverycost').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

  //発送元
  $('#product_prefecture_id').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-pref').text('選択して下さい');
      $(this).css('border-color','red');
    }else{
      $('#error-pref').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });
  //発送までの日数
  $('#product_delivery_days_id').on('blur',function(){
    let value = $(this).val();
    if(value == ""){
      $('#error-delivery_days').text('選択して下さい');
      $(this).css('border-color','red');
    }else{
      $('#error-delivery_days').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

  //価格
  $('#price').on('blur',function(){
    let value = $(this).val();
    if(value < 300 || value > 9999999){
      $('#error-price').text('入力してください');
      $(this).css('border-color','red');
    }else{
      $('#error-price').text('');
      $(this).css('border-color','rgb(204, 204, 204)');
    }
  });

});