// content.js
(function() {
  class Comment {
    constructor(number, element) {
      this.number = number;
      this.element = element;
      this.replies = [];
    }

    addReply(reply) {
      this.replies.push(reply);
    }
  }

  function parseComments() {
    const comments = document.querySelectorAll('.commentlist > li');
    const commentMap = new Map();

    comments.forEach((comment) => {
      const numberElement = comment.querySelector('small.commentmetadata');
      if (numberElement) {
        const numberMatch = numberElement.textContent.match(/Comment #(\d+)/);
        const number = numberMatch ? parseInt(numberMatch[1]) : null;
        
        if (number !== null) {
          const newComment = new Comment(number, comment);
          commentMap.set(number, newComment);
        }
      }
    });

    return commentMap;
  }

  function buildCommentTree(commentMap) {
    const rootComments = [];
    const replyRegex = /^([^#]+)\s*#(\d+):\s*/;

    commentMap.forEach((comment) => {
      const contentElements = comment.element.querySelectorAll('p');
      let isReply = false;
      let replyToComment = null;

      for (let i = 0; i < contentElements.length; i++) {
        const contentElement = contentElements[i];
        const text = contentElement.textContent;
        const match = text.match(replyRegex);

        if (match) {
          const [fullMatch, replyAuthor, replyToNumber] = match;
          replyToComment = commentMap.get(parseInt(replyToNumber));

          if (replyToComment) {
            isReply = true;
            replyToComment.addReply(comment);
            // Remove the reply prefix from the content
            contentElement.textContent = text.replace(replyRegex, '');
            break;
          }
        }
      }

      if (!isReply) {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

function renderCommentTree(comment, level = 0) {
  const commentElement = comment.element.cloneNode(true);
  commentElement.classList.add('comment');

  if (comment.replies.length > 0) {
    const repliesElement = document.createElement('div'); // Changed from 'ol' to 'div'
    repliesElement.className = 'replies';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-replies';
    toggleButton.textContent = `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}`;
    commentElement.appendChild(toggleButton);

    comment.replies.forEach(reply => {
      repliesElement.appendChild(renderCommentTree(reply, level + 1));
    });

    commentElement.appendChild(repliesElement);

    toggleButton.addEventListener('click', function() {
      repliesElement.classList.toggle('hidden');
      this.textContent = repliesElement.classList.contains('hidden') ?
        `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}` :
        `Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}`;
    });
  }

  return commentElement;
}

  function restructureComments() {
    const commentMap = parseComments();
    const rootComments = buildCommentTree(commentMap);
    
    const commentList = document.querySelector('.commentlist');
    commentList.innerHTML = '';

    rootComments.forEach(comment => {
      commentList.appendChild(renderCommentTree(comment));
    });
  }

  // Run the restructuring when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restructureComments);
  } else {
    restructureComments();
  }
})();